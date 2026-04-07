import { computeRisk, computeRiskV2, conditionFromRatio } from '../src/core/services/riskEngine';
import type { HouseInputs, LifecycleFlag } from '../src/core/models/types';

const baseInputs: HouseInputs = {
  byggnadstyp: 'enplanshus',
  byggnadsar: 2020,
  size: 120,
  grundlaeggning: 'krypgrund',
  yttertakType: 'betongpannor',
  yttertakAge: 2,
  fasadType: 'tegel',
  fasadAge: 5,
  uppvarmning: 'bergvarme',
  ventilation: 'ftxMekanisk',
};

describe('computeRisk', () => {
  test('score is low for a new well-maintained house', () => {
    const result = computeRisk(baseInputs);
    expect(result.score).toBeLessThanOrEqual(20);
    expect(result.scoreBand).toBe('low');
    expect(result.lifecycleFlags).toHaveLength(0);
    expect(result.costBand.min).toBeGreaterThanOrEqual(0);
  });

  test('flags roof when age exceeds 70% of lifespan', () => {
    // takpapp lifespan = 20; 18/20 = 0.9 >= 0.9 → highRisk
    const inputs: HouseInputs = { ...baseInputs, yttertakType: 'takpapp', yttertakAge: 18 };
    const result = computeRisk(inputs);
    const roofFlag = result.lifecycleFlags.find((f) => f.component === 'roof');
    expect(roofFlag).toBeDefined();
    expect(roofFlag?.level).toBe('highRisk');
    expect(result.score).toBeGreaterThan(0);
  });

  test('roof risk (not high) at 70%–89% of lifespan', () => {
    // takpapp lifespan = 20; 15/20 = 0.75 → risk
    const inputs: HouseInputs = { ...baseInputs, yttertakType: 'takpapp', yttertakAge: 15 };
    const result = computeRisk(inputs);
    const roofFlag = result.lifecycleFlags.find((f) => f.component === 'roof');
    expect(roofFlag?.level).toBe('risk');
  });

  test('checklist always contains base items', () => {
    const result = computeRisk(baseInputs);
    expect(result.negotiationChecklist).toContain('askSellerRoofFacadeDrainage');
    expect(result.negotiationChecklist).toContain('demandBuyerInspection');
  });

  test('betongplatta 70s rule adds drainage flag when no drainage input given', () => {
    const inputs: HouseInputs = { ...baseInputs, byggnadsar: 1975, grundlaeggning: 'betongplatta' };
    const result = computeRisk(inputs);
    const drainFlag = result.lifecycleFlags.find((f) => f.component === 'drainage');
    expect(drainFlag).toBeDefined();
    expect(drainFlag?.messageKey).toBe('betongplatta70s');
    expect(drainFlag?.triggeredBy).toContain('byggnadsar');
    expect(drainFlag?.triggeredBy).toContain('grundlaeggning');
  });

  test('betongplatta 70s rule does NOT double-add when draneringAge already flags', () => {
    // draneringAge 23/25 = 0.92 → highRisk drainage; betongplatta 70s should not add a second
    const inputs: HouseInputs = { ...baseInputs, byggnadsar: 1975, grundlaeggning: 'betongplatta', draneringAge: 23 };
    const result = computeRisk(inputs);
    const drainFlags = result.lifecycleFlags.filter((f) => f.component === 'drainage');
    expect(drainFlags).toHaveLength(1);
  });

  test('direct electric heating adds heating flag', () => {
    const inputs: HouseInputs = { ...baseInputs, uppvarmning: 'direktverkandeEl' };
    const result = computeRisk(inputs);
    expect(result.lifecycleFlags.some((f) => f.component === 'heating')).toBe(true);
  });

  test('sjalvdrag ventilation adds ventilation flag', () => {
    const inputs: HouseInputs = { ...baseInputs, ventilation: 'sjalvdrag' };
    const result = computeRisk(inputs);
    expect(result.lifecycleFlags.some((f) => f.component === 'ventilation')).toBe(true);
  });

  test('score is clamped to 0–100', () => {
    // Max possible: roof highRisk(25) + facade highRisk(20) + drainage highRisk(15) + ventilation(10) + heating(8) + wetRooms highRisk(12) = 90
    const inputs: HouseInputs = {
      byggnadstyp: 'enplanshus', byggnadsar: 1970, size: 120,
      grundlaeggning: 'krypgrund',
      yttertakType: 'takpapp', yttertakAge: 19,   // 19/20 = 0.95 → highRisk
      fasadType: 'puts', fasadAge: 28,             // 28/30 = 0.93 → highRisk
      uppvarmning: 'direktverkandeEl',
      ventilation: 'sjalvdrag',
      draneringAge: 24,  // 24/25 = 0.96 → highRisk
      vatrumAge: 19,     // 19/20 = 0.95 → highRisk
    };
    const result = computeRisk(inputs);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(result.score).toBeGreaterThan(0);
  });

  test('tegel facade is skipped (no lifespan)', () => {
    const inputs: HouseInputs = { ...baseInputs, fasadType: 'tegel', fasadAge: 100 };
    const result = computeRisk(inputs);
    expect(result.lifecycleFlags.some((f) => f.component === 'facade')).toBe(false);
  });
});

describe('conditionFromRatio (v2)', () => {
  test('is clamped to [0..1] and monotonic-ish over increasing ratio', () => {
    const ratios = [0, 0.1, 0.5, 0.7, 0.9, 1.1, 2.0];
    const vals = ratios.map(conditionFromRatio);
    for (const v of vals) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(1);
    }
    for (let i = 1; i < vals.length; i++) {
      expect(vals[i]).toBeGreaterThanOrEqual(vals[i - 1]);
    }
  });
});

describe('computeRiskV2', () => {
  test('produces a low score for a modern house baseline', () => {
    const result = computeRiskV2(baseInputs);
    expect(result.scoreBand).toBe('low');
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThan(35);
  });

  test('score increases when roof age increases (all else equal)', () => {
    const a = computeRiskV2({ ...baseInputs, yttertakType: 'takpapp', yttertakAge: 2 }).score;
    const b = computeRiskV2({ ...baseInputs, yttertakType: 'takpapp', yttertakAge: 10 }).score;
    const c = computeRiskV2({ ...baseInputs, yttertakType: 'takpapp', yttertakAge: 18 }).score;
    expect(b).toBeGreaterThanOrEqual(a);
    expect(c).toBeGreaterThanOrEqual(b);
  });

  test('slab-era betongplatta emits the betongplatta70s drainage flag when drainageAge not provided', () => {
    const result = computeRiskV2({ ...baseInputs, byggnadsar: 1975, grundlaeggning: 'betongplatta' });
    const drainFlag = result.lifecycleFlags.find((f) => f.messageKey === 'betongplatta70s');
    expect(drainFlag).toBeDefined();
    expect(drainFlag?.component).toBe('drainage');
  });

  test('slab-era betongplatta increases drainage condition when drainageAge is provided (multiplier)', () => {
    const base = computeRiskV2({ ...baseInputs, draneringAge: 10 }).score;
    const slab = computeRiskV2({ ...baseInputs, byggnadsar: 1975, grundlaeggning: 'betongplatta', draneringAge: 10 }).score;
    expect(slab).toBeGreaterThanOrEqual(base);
  });

  test('sjalvdrag ventilation increases wet room condition when vatrumAge is provided (multiplier)', () => {
    const mech = computeRiskV2({ ...baseInputs, vatrumAge: 10, ventilation: 'fMekanisk' }).score;
    const sj = computeRiskV2({ ...baseInputs, vatrumAge: 10, ventilation: 'sjalvdrag' }).score;
    expect(sj).toBeGreaterThanOrEqual(mech);
  });

  test('contributionPercent is normalized across flags (≈100)', () => {
    const result = computeRiskV2({
      ...baseInputs,
      byggnadsar: 1975,
      grundlaeggning: 'betongplatta',
      yttertakType: 'takpapp',
      yttertakAge: 18,
      vatrumAge: 19,
      ventilation: 'sjalvdrag',
      uppvarmning: 'direktverkandeEl',
    });
    const sum = result.lifecycleFlags.reduce((a, f) => a + f.contributionPercent, 0);
    expect(sum).toBeGreaterThanOrEqual(98);
    expect(sum).toBeLessThanOrEqual(102);
  });
});
