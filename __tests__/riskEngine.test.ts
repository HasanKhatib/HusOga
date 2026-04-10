import { computeRisk, conditionFromRatio, buildDecisionPoints } from '../src/core/services/riskEngine';
import type { HouseInputs, ComponentCondition } from '../src/core/models/types';

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

function getComponent(conditions: ComponentCondition[], component: ComponentCondition['component']) {
  return conditions.find((c) => c.component === component);
}

describe('computeRisk — always emits 6 components', () => {
  test('always returns exactly 6 componentConditions', () => {
    const result = computeRisk(baseInputs);
    expect(result.componentConditions).toHaveLength(6);
  });

  test('all 6 components present by name', () => {
    const result = computeRisk(baseInputs);
    const names = result.componentConditions.map((c) => c.component);
    expect(names).toContain('roof');
    expect(names).toContain('facade');
    expect(names).toContain('grund');
    expect(names).toContain('vatrum');
    expect(names).toContain('ventilation');
    expect(names).toContain('uppvarmning');
  });

  test('new well-maintained house: structural components ok', () => {
    // krypgrund without draneringAge gets 'attention' — that is intentional engine behaviour.
    // Roof, facade, vatrum, ventilation and uppvarmning should all be ok for baseInputs.
    const result = computeRisk(baseInputs);
    const structural: ComponentCondition['component'][] = ['roof', 'facade', 'vatrum', 'ventilation', 'uppvarmning'];
    for (const name of structural) {
      const cc = getComponent(result.componentConditions, name)!;
      expect(cc.level).toBe('ok');
    }
  });

  test('each component has a valid ConditionLevel', () => {
    const result = computeRisk(baseInputs);
    for (const cc of result.componentConditions) {
      expect(['ok', 'attention', 'priority']).toContain(cc.level);
    }
  });
});

describe('computeRisk — roof', () => {
  test('old takpapp roof → attention or priority', () => {
    const inputs: HouseInputs = { ...baseInputs, yttertakType: 'takpapp', yttertakAge: 15 };
    const result = computeRisk(inputs);
    const roof = getComponent(result.componentConditions, 'roof')!;
    expect(['attention', 'priority']).toContain(roof.level);
  });

  test('very old takpapp roof → priority', () => {
    const inputs: HouseInputs = { ...baseInputs, yttertakType: 'takpapp', yttertakAge: 19 };
    const result = computeRisk(inputs);
    const roof = getComponent(result.componentConditions, 'roof')!;
    expect(roof.level).toBe('priority');
    expect(roof.messageKey).toBe('roofPriority');
  });

  test('new roof → ok', () => {
    const inputs: HouseInputs = { ...baseInputs, yttertakType: 'takpapp', yttertakAge: 2 };
    const result = computeRisk(inputs);
    const roof = getComponent(result.componentConditions, 'roof')!;
    expect(roof.level).toBe('ok');
    expect(roof.messageKey).toBe('roofOk');
  });

  test('roof carries ageYears and lifespanYears', () => {
    const inputs: HouseInputs = { ...baseInputs, yttertakType: 'takpapp', yttertakAge: 10 };
    const result = computeRisk(inputs);
    const roof = getComponent(result.componentConditions, 'roof')!;
    expect(roof.ageYears).toBe(10);
    expect(roof.lifespanYears).toBe(20);
  });
});

describe('computeRisk — facade', () => {
  test('tegel facade → always ok (no lifespan)', () => {
    const inputs: HouseInputs = { ...baseInputs, fasadType: 'tegel', fasadAge: 100 };
    const result = computeRisk(inputs);
    const facade = getComponent(result.componentConditions, 'facade')!;
    expect(facade.level).toBe('ok');
    expect(facade.messageKey).toBe('facadeOk');
  });

  test('old puts facade → attention or priority', () => {
    const inputs: HouseInputs = { ...baseInputs, fasadType: 'puts', fasadAge: 28 };
    const result = computeRisk(inputs);
    const facade = getComponent(result.componentConditions, 'facade')!;
    expect(['attention', 'priority']).toContain(facade.level);
  });
});

describe('computeRisk — grund', () => {
  test('betongplatta 70s + no drainage age → attention (slab70s rule)', () => {
    const inputs: HouseInputs = { ...baseInputs, byggnadsar: 1975, grundlaeggning: 'betongplatta' };
    const result = computeRisk(inputs);
    const grund = getComponent(result.componentConditions, 'grund')!;
    expect(['attention', 'priority']).toContain(grund.level);
    expect(grund.messageKey).toBe('grundSlab70s');
    expect(grund.triggeredBy).toContain('byggnadsar');
  });

  test('betongplatta 70s with old drainage → slab70s message', () => {
    const inputs: HouseInputs = {
      ...baseInputs, byggnadsar: 1975, grundlaeggning: 'betongplatta', draneringAge: 22,
    };
    const result = computeRisk(inputs);
    const grund = getComponent(result.componentConditions, 'grund')!;
    expect(grund.messageKey).toBe('grundSlab70s');
    expect(grund.triggeredBy).toContain('draneringAge');
    expect(grund.triggeredBy).toContain('byggnadsar');
  });

  test('modern krypgrund + no drainage age → attention (unknown drainage)', () => {
    // krypgrund with no drainage age data → attention is correct: unknown state, caution warranted
    const result = computeRisk(baseInputs); // krypgrund, no draneringAge
    const grund = getComponent(result.componentConditions, 'grund')!;
    expect(grund.level).toBe('attention');
  });
});

describe('computeRisk — vatrum', () => {
  test('no vatrumAge → ok with vatrumUnknown key', () => {
    const result = computeRisk(baseInputs);
    const vatrum = getComponent(result.componentConditions, 'vatrum')!;
    expect(vatrum.level).toBe('ok');
    expect(vatrum.messageKey).toBe('vatrumUnknown');
  });

  test('old vatrum → attention or priority', () => {
    const inputs: HouseInputs = { ...baseInputs, vatrumAge: 19 };
    const result = computeRisk(inputs);
    const vatrum = getComponent(result.componentConditions, 'vatrum')!;
    expect(['attention', 'priority']).toContain(vatrum.level);
  });

  test('sjalvdrag amplifies vatrum condition', () => {
    const mech = computeRisk({ ...baseInputs, vatrumAge: 12, ventilation: 'fMekanisk' });
    const sj = computeRisk({ ...baseInputs, vatrumAge: 12, ventilation: 'sjalvdrag' });
    const mechVatrum = getComponent(mech.componentConditions, 'vatrum')!;
    const sjVatrum = getComponent(sj.componentConditions, 'vatrum')!;
    // sjalvdrag should produce same or worse level
    const levels = ['ok', 'attention', 'priority'];
    expect(levels.indexOf(sjVatrum.level)).toBeGreaterThanOrEqual(levels.indexOf(mechVatrum.level));
  });
});

describe('computeRisk — ventilation', () => {
  test('ftxMekanisk → ok', () => {
    const result = computeRisk({ ...baseInputs, ventilation: 'ftxMekanisk' });
    const v = getComponent(result.componentConditions, 'ventilation')!;
    expect(v.level).toBe('ok');
  });

  test('sjalvdrag → attention or priority', () => {
    const result = computeRisk({ ...baseInputs, ventilation: 'sjalvdrag' });
    const v = getComponent(result.componentConditions, 'ventilation')!;
    expect(['attention', 'priority']).toContain(v.level);
  });
});

describe('computeRisk — uppvarmning', () => {
  test('bergvarme → ok', () => {
    const result = computeRisk({ ...baseInputs, uppvarmning: 'bergvarme' });
    const u = getComponent(result.componentConditions, 'uppvarmning')!;
    expect(u.level).toBe('ok');
    expect(u.messageKey).toBe('uppvarmningOk');
  });

  test('direktverkandeEl → attention or priority', () => {
    const result = computeRisk({ ...baseInputs, uppvarmning: 'direktverkandeEl' });
    const u = getComponent(result.componentConditions, 'uppvarmning')!;
    expect(['attention', 'priority']).toContain(u.level);
  });
});

describe('computeRisk — greenSignals', () => {
  test('bergvarme → greenBergvarme signal', () => {
    const result = computeRisk({ ...baseInputs, uppvarmning: 'bergvarme' });
    expect(result.greenSignals.some((s) => s.messageKey === 'greenBergvarme')).toBe(true);
  });

  test('ftxMekanisk → greenFtx signal', () => {
    const result = computeRisk({ ...baseInputs, ventilation: 'ftxMekanisk' });
    expect(result.greenSignals.some((s) => s.messageKey === 'greenFtx')).toBe(true);
  });

  test('tegel facade → greenTegelFasad signal', () => {
    const result = computeRisk({ ...baseInputs, fasadType: 'tegel' });
    expect(result.greenSignals.some((s) => s.messageKey === 'greenTegelFasad')).toBe(true);
  });

  test('direktverkandeEl → no green signals for heating', () => {
    const result = computeRisk({ ...baseInputs, uppvarmning: 'direktverkandeEl' });
    expect(result.greenSignals.some((s) => s.messageKey === 'greenBergvarme')).toBe(false);
    expect(result.greenSignals.some((s) => s.messageKey === 'greenFjärrvärme')).toBe(false);
  });
});

describe('computeRisk — viewingTips', () => {
  test('slab70s inputs → tipSlab70s in viewingTips', () => {
    const result = computeRisk({ ...baseInputs, byggnadsar: 1975, grundlaeggning: 'betongplatta' });
    expect(result.viewingTips).toContain('tipSlab70s');
  });

  test('krypgrund → tipCrawlSpace in viewingTips', () => {
    const result = computeRisk({ ...baseInputs, grundlaeggning: 'krypgrund' });
    expect(result.viewingTips).toContain('tipCrawlSpace');
  });

  test('always returns at least 2 viewing tips', () => {
    const result = computeRisk(baseInputs);
    expect(result.viewingTips.length).toBeGreaterThanOrEqual(2);
  });

  test('caps at 6 viewing tips', () => {
    const result = computeRisk({
      ...baseInputs,
      byggnadsar: 1975,
      grundlaeggning: 'betongplatta',
      ventilation: 'sjalvdrag',
      uppvarmning: 'direktverkandeEl',
      yttertakType: 'takpapp',
      yttertakAge: 15,
      vatrumAge: 15,
    });
    expect(result.viewingTips.length).toBeLessThanOrEqual(6);
  });
});

describe('computeRisk — costBand', () => {
  test('all ok structural house → zero cost band (krypgrund without drainage age excluded)', () => {
    // Use kallare foundation which has lower base condition and no cost implication without age data
    const cleanInputs: HouseInputs = {
      ...baseInputs,
      grundlaeggning: 'betongplatta',
      byggnadsar: 2010, // not 70s slab
    };
    const result = computeRisk(cleanInputs);
    expect(result.costBand.min).toBe(0);
    expect(result.costBand.likely).toBe(0);
    expect(result.costBand.max).toBe(0);
  });

  test('old roof → non-zero cost', () => {
    const result = computeRisk({ ...baseInputs, yttertakType: 'takpapp', yttertakAge: 18 });
    expect(result.costBand.likely).toBeGreaterThan(0);
  });

  test('costBand max >= likely >= min', () => {
    const result = computeRisk({
      ...baseInputs, yttertakType: 'takpapp', yttertakAge: 18,
      fasadType: 'puts', fasadAge: 28, vatrumAge: 19,
    });
    expect(result.costBand.max).toBeGreaterThanOrEqual(result.costBand.likely);
    expect(result.costBand.likely).toBeGreaterThanOrEqual(result.costBand.min);
  });
});

describe('buildDecisionPoints', () => {
  test('always contains demandBuyerInspection', () => {
    const result = computeRisk(baseInputs);
    const points = buildDecisionPoints(result.componentConditions);
    expect(points).toContain('demandBuyerInspection');
  });

  test('slab70s → betongplatta70sCheck in decision points', () => {
    const result = computeRisk({ ...baseInputs, byggnadsar: 1975, grundlaeggning: 'betongplatta' });
    const points = buildDecisionPoints(result.componentConditions);
    expect(points).toContain('betongplatta70sCheck');
  });

  test('old vatrum → vatrumCheck in decision points', () => {
    const result = computeRisk({ ...baseInputs, vatrumAge: 19 });
    const points = buildDecisionPoints(result.componentConditions);
    expect(points).toContain('vatrumCheck');
  });
});

describe('conditionFromRatio', () => {
  test('is clamped to [0..1] and monotonic over increasing ratio', () => {
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
