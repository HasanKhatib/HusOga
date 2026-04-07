import type { HouseInputs, RiskOutput, LifecycleFlag, CostBand, ScoreBand } from '../models/types';
import { roofLifespans, fasadLifespans, drainageLifespan, vatrumLifespan } from '../data/lifespans';
import { roofCosts, fasadCostPerSqm, drainageCost, vatrumCost } from '../data/costs';

export const MODEL_VERSION = '1.1.0';

const RISK_THRESHOLD = 0.7;
const HIGH_RISK_THRESHOLD = 0.9;

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Continuous deterioration curve (v2): ratio=age/lifespan → condition in [0..1].
 * Designed to accelerate near end-of-life while staying continuous.
 */
export function conditionFromRatio(ratio: number): number {
  const r = ratio;
  if (!Number.isFinite(r)) return 0;
  if (r <= 0) return 0;
  if (r <= 0.5) return lerp(0.0, 0.2, r / 0.5);
  if (r <= 0.7) return lerp(0.2, 0.4, (r - 0.5) / 0.2);
  if (r <= 0.9) return lerp(0.4, 0.7, (r - 0.7) / 0.2);
  if (r <= 1.1) return lerp(0.7, 0.9, (r - 0.9) / 0.2);
  return lerp(0.9, 1.0, Math.min((r - 1.1) / 0.4, 1.0));
}

// v2 component weights (must sum to 1.0)
const WEIGHTS_V2 = {
  roof: 0.2,
  wetRooms: 0.2,
  drainage: 0.15,
  facade: 0.1,
  ventilation: 0.15,
  heating: 0.1,
  foundationBucket: 0.1,
} as const;

function foundationBucketCondition(inputs: HouseInputs): number {
  if (inputs.grundlaeggning === 'betongplatta') {
    if (inputs.byggnadsar >= 1965 && inputs.byggnadsar <= 1985) return 0.55;
    return 0.3;
  }
  if (inputs.grundlaeggning === 'krypgrund') return 0.5;
  if (inputs.grundlaeggning === 'kallare') return 0.35;
  if (inputs.grundlaeggning === 'suterrang') return 0.4;
  return 0.25;
}

function ventilationCondition(inputs: HouseInputs): number {
  if (inputs.ventilation === 'sjalvdrag') return 0.55;
  if (inputs.ventilation === 'fMekanisk') return 0.2;
  return 0.1;
}

function heatingCondition(inputs: HouseInputs): number {
  if (inputs.uppvarmning === 'direktverkandeEl') return 0.45;
  return 0.15;
}

function levelFromCondition(c: number): LifecycleFlag['level'] | null {
  if (c >= 0.7) return 'highRisk';
  if (c >= 0.4) return 'risk';
  return null;
}

function messageKeyFor(component: LifecycleFlag['component'], level: LifecycleFlag['level']): string {
  if (component === 'roof') return level === 'highRisk' ? 'roofHighRisk' : 'roofRisk';
  if (component === 'facade') return level === 'highRisk' ? 'facadeHighRisk' : 'facadeRisk';
  if (component === 'drainage') return level === 'highRisk' ? 'drainageHighRisk' : 'drainageRisk';
  if (component === 'wetRooms') return level === 'highRisk' ? 'wetRoomsHighRisk' : 'wetRoomsRisk';
  if (component === 'ventilation') return 'ventilationRisk';
  return 'heatingRisk';
}

function scoreToBand(score: number): ScoreBand {
  if (score < 30) return 'low';
  if (score < 60) return 'medium';
  return 'high';
}

function buildChecklist(flags: LifecycleFlag[]): string[] {
  const items: string[] = ['askSellerRoofFacadeDrainage', 'demandBuyerInspection'];
  if (flags.some((f) => f.component === 'drainage')) items.push('betongplatta70sCheck');
  if (flags.some((f) => f.component === 'wetRooms')) items.push('vatrumCheck');
  if (flags.some((f) => f.component === 'roof')) items.push('roofSnowCheck');
  return items;
}

/**
 * v2 engine: continuous curve + explicit weights.
 * Keep v1 computeRisk() unchanged until we also ship MODEL_VERSION bump + stale handling.
 */
export function computeRiskV2(inputs: HouseInputs): RiskOutput {
  const components: {
    key: keyof typeof WEIGHTS_V2;
    component?: LifecycleFlag['component'];
    condition: number;
    triggeredBy: string[];
  }[] = [];

  const slab70s = inputs.byggnadsar >= 1965 && inputs.byggnadsar <= 1985 && inputs.grundlaeggning === 'betongplatta';

  // Roof
  const roofLifespan = roofLifespans[inputs.yttertakType] ?? roofLifespans.other;
  const roofC = clamp01(conditionFromRatio(inputs.yttertakAge / roofLifespan));
  components.push({ key: 'roof', component: 'roof', condition: roofC, triggeredBy: ['yttertakType', 'yttertakAge'] });

  // Facade
  const fasadLifespan = fasadLifespans[inputs.fasadType];
  const facadeC = fasadLifespan == null ? 0 : clamp01(conditionFromRatio(inputs.fasadAge / fasadLifespan));
  components.push({ key: 'facade', component: 'facade', condition: facadeC, triggeredBy: ['fasadType', 'fasadAge'] });

  // Drainage (optional direct input)
  let drainageC = inputs.draneringAge == null ? 0 : clamp01(conditionFromRatio(inputs.draneringAge / drainageLifespan));
  const drainageTriggeredBy = ['draneringAge'];
  if (slab70s && inputs.draneringAge != null) {
    drainageC = clamp01(drainageC * 1.15);
    drainageTriggeredBy.push('byggnadsar', 'grundlaeggning');
  }
  components.push({ key: 'drainage', component: 'drainage', condition: drainageC, triggeredBy: drainageTriggeredBy });

  // Wet rooms (optional)
  let wetRoomsC = inputs.vatrumAge == null ? 0 : clamp01(conditionFromRatio(inputs.vatrumAge / vatrumLifespan));
  const wetRoomsTriggeredBy = ['vatrumAge'];
  if (slab70s && inputs.vatrumAge != null) {
    wetRoomsC = clamp01(wetRoomsC * 1.05);
    wetRoomsTriggeredBy.push('byggnadsar', 'grundlaeggning');
  }
  if (inputs.ventilation === 'sjalvdrag' && inputs.vatrumAge != null) {
    wetRoomsC = clamp01(wetRoomsC * 1.1);
    wetRoomsTriggeredBy.push('ventilation');
  }
  components.push({ key: 'wetRooms', component: 'wetRooms', condition: wetRoomsC, triggeredBy: wetRoomsTriggeredBy });

  // Ventilation (type-based)
  const ventC = clamp01(ventilationCondition(inputs));
  components.push({ key: 'ventilation', component: 'ventilation', condition: ventC, triggeredBy: ['ventilation'] });

  // Heating (type-based)
  const heatC = clamp01(heatingCondition(inputs));
  components.push({ key: 'heating', component: 'heating', condition: heatC, triggeredBy: ['uppvarmning'] });

  // Foundation risk bucket (continuous contributor, no direct flag)
  const foundationC = clamp01(foundationBucketCondition(inputs));
  components.push({ key: 'foundationBucket', condition: foundationC, triggeredBy: ['byggnadsar', 'grundlaeggning'] });

  const weightedSum = components.reduce((acc, c) => acc + WEIGHTS_V2[c.key] * c.condition, 0);
  const score = Math.min(100, Math.max(0, Math.round(100 * weightedSum)));

  // Flags are emitted only for explicit components (not foundationBucket)
  const flagged = components
    .filter((c): c is (typeof components)[number] & { component: LifecycleFlag['component'] } => !!c.component)
    .map((c) => {
      const level = levelFromCondition(c.condition);
      return level
        ? {
            component: c.component,
            level,
            triggeredBy: c.triggeredBy,
            contribution: WEIGHTS_V2[c.key] * c.condition,
          }
        : null;
    })
    .filter((x): x is NonNullable<typeof x> => x != null);

  // Special rule: keep the slab-era drainage warning as a discrete flag for explainability.
  const hasDrainageFlag = flagged.some((f) => f.component === 'drainage');
  if (slab70s && !hasDrainageFlag) {
    flagged.push({
      component: 'drainage',
      level: 'risk',
      triggeredBy: ['byggnadsar', 'grundlaeggning'],
      contribution: WEIGHTS_V2.foundationBucket * foundationC,
    });
  }

  const denom = flagged.reduce((a, b) => a + b.contribution, 0) || 1;
  const lifecycleFlags: LifecycleFlag[] = flagged.map((f) => ({
    component: f.component,
    level: f.level,
    triggeredBy: f.triggeredBy,
    contributionPercent: Math.round((100 * f.contribution) / denom),
    messageKey: slab70s && f.component === 'drainage' && f.triggeredBy.includes('grundlaeggning') ? 'betongplatta70s' : messageKeyFor(f.component, f.level),
  }));

  // v2 keeps v1 cost behavior for now (updated later with expected-value coupling).
  const costMins: number[] = [];
  const costLikelys: number[] = [];
  const costMaxs: number[] = [];
  function addCost(range: [number, number]) {
    costMins.push(range[0]);
    costLikelys.push(Math.round((range[0] + range[1]) / 2));
    costMaxs.push(range[1]);
  }

  // Add costs if the corresponding component has a flag.
  if (lifecycleFlags.some((f) => f.component === 'roof')) addCost(roofCosts[inputs.yttertakType] ?? roofCosts.other);
  if (lifecycleFlags.some((f) => f.component === 'drainage')) addCost(drainageCost);
  if (lifecycleFlags.some((f) => f.component === 'wetRooms')) addCost(vatrumCost);
  if (lifecycleFlags.some((f) => f.component === 'facade')) {
    const cp = fasadCostPerSqm[inputs.fasadType] ?? 1500;
    if (cp > 0) {
      const cost = Math.round(inputs.size * cp);
      addCost([Math.round(cost * 0.8), Math.round(cost * 1.2)]);
    }
  }

  const costBand: CostBand = {
    min: costMins.reduce((a, b) => a + b, 0),
    likely: costLikelys.reduce((a, b) => a + b, 0),
    max: costMaxs.reduce((a, b) => a + b, 0),
  };

  return {
    score,
    scoreBand: scoreToBand(score),
    lifecycleFlags,
    costBand,
    negotiationChecklist: buildChecklist(lifecycleFlags),
  };
}

export function computeRisk(inputs: HouseInputs): RiskOutput {
  return computeRiskV2(inputs);
}

export function computeRiskV1(inputs: HouseInputs): RiskOutput {
  const flags: LifecycleFlag[] = [];
  let totalScore = 0;
  const costMins: number[] = [];
  const costLikelys: number[] = [];
  const costMaxs: number[] = [];

  function addCost(range: [number, number]) {
    costMins.push(range[0]);
    costLikelys.push(Math.round((range[0] + range[1]) / 2));
    costMaxs.push(range[1]);
  }

  // ── Roof ──────────────────────────────────────────────────────────────────
  const roofLifespan = roofLifespans[inputs.yttertakType] ?? roofLifespans.other;
  const roofRatio = inputs.yttertakAge / roofLifespan;
  if (roofRatio >= HIGH_RISK_THRESHOLD) {
    flags.push({ component: 'roof', level: 'highRisk', triggeredBy: ['yttertakType', 'yttertakAge'], contributionPercent: 25, messageKey: 'roofHighRisk' });
    totalScore += 25;
    addCost(roofCosts[inputs.yttertakType] ?? roofCosts.other);
  } else if (roofRatio >= RISK_THRESHOLD) {
    flags.push({ component: 'roof', level: 'risk', triggeredBy: ['yttertakType', 'yttertakAge'], contributionPercent: 15, messageKey: 'roofRisk' });
    totalScore += 15;
    addCost(roofCosts[inputs.yttertakType] ?? roofCosts.other);
  }

  // ── Facade ────────────────────────────────────────────────────────────────
  const fasadLifespan = fasadLifespans[inputs.fasadType];
  if (fasadLifespan != null) {
    const ratio = inputs.fasadAge / fasadLifespan;
    if (ratio >= HIGH_RISK_THRESHOLD) {
      flags.push({ component: 'facade', level: 'highRisk', triggeredBy: ['fasadType', 'fasadAge'], contributionPercent: 20, messageKey: 'facadeHighRisk' });
      totalScore += 20;
      const cp = fasadCostPerSqm[inputs.fasadType] ?? 1500;
      if (cp > 0) {
        const cost = Math.round(inputs.size * cp);
        addCost([Math.round(cost * 0.8), Math.round(cost * 1.2)]);
      }
    } else if (ratio >= RISK_THRESHOLD) {
      flags.push({ component: 'facade', level: 'risk', triggeredBy: ['fasadType', 'fasadAge'], contributionPercent: 12, messageKey: 'facadeRisk' });
      totalScore += 12;
      const cp = fasadCostPerSqm[inputs.fasadType] ?? 1500;
      if (cp > 0) {
        const cost = Math.round(inputs.size * cp);
        addCost([Math.round(cost * 0.8), Math.round(cost * 1.2)]);
      }
    }
  }

  // ── Drainage (optional direct input) ─────────────────────────────────────
  if (inputs.draneringAge != null) {
    const ratio = inputs.draneringAge / drainageLifespan;
    if (ratio >= HIGH_RISK_THRESHOLD) {
      flags.push({ component: 'drainage', level: 'highRisk', triggeredBy: ['draneringAge'], contributionPercent: 15, messageKey: 'drainageHighRisk' });
      totalScore += 15;
      addCost(drainageCost);
    } else if (ratio >= RISK_THRESHOLD) {
      flags.push({ component: 'drainage', level: 'risk', triggeredBy: ['draneringAge'], contributionPercent: 8, messageKey: 'drainageRisk' });
      totalScore += 8;
      addCost(drainageCost);
    }
  }

  // ── Ventilation ───────────────────────────────────────────────────────────
  if (inputs.ventilation === 'sjalvdrag') {
    flags.push({ component: 'ventilation', level: 'risk', triggeredBy: ['ventilation'], contributionPercent: 10, messageKey: 'ventilationRisk' });
    totalScore += 10;
  }

  // ── Heating ───────────────────────────────────────────────────────────────
  if (inputs.uppvarmning === 'direktverkandeEl') {
    flags.push({ component: 'heating', level: 'risk', triggeredBy: ['uppvarmning'], contributionPercent: 8, messageKey: 'heatingRisk' });
    totalScore += 8;
  }

  // ── Wet rooms (optional) ─────────────────────────────────────────────────
  if (inputs.vatrumAge != null) {
    const ratio = inputs.vatrumAge / vatrumLifespan;
    if (ratio >= HIGH_RISK_THRESHOLD) {
      flags.push({ component: 'wetRooms', level: 'highRisk', triggeredBy: ['vatrumAge'], contributionPercent: 12, messageKey: 'wetRoomsHighRisk' });
      totalScore += 12;
      addCost(vatrumCost);
    } else if (ratio >= RISK_THRESHOLD) {
      flags.push({ component: 'wetRooms', level: 'risk', triggeredBy: ['vatrumAge'], contributionPercent: 6, messageKey: 'wetRoomsRisk' });
      totalScore += 6;
      addCost(vatrumCost);
    }
  }

  // ── Suterrang / betongplatta 70s auto-rule ────────────────────────────────
  if (
    inputs.byggnadsar >= 1965 &&
    inputs.byggnadsar <= 1985 &&
    inputs.grundlaeggning === 'betongplatta' &&
    !flags.some((f) => f.component === 'drainage')
  ) {
    flags.push({ component: 'drainage', level: 'risk', triggeredBy: ['byggnadsar', 'grundlaeggning'], contributionPercent: 10, messageKey: 'betongplatta70s' });
    totalScore += 10;
    addCost(drainageCost);
  }

  const score = Math.min(100, Math.max(0, totalScore));
  const minC = costMins.reduce((a, b) => a + b, 0);
  const likelyC = costLikelys.reduce((a, b) => a + b, 0);
  const maxC = costMaxs.reduce((a, b) => a + b, 0);

  const costBand: CostBand = { min: minC, likely: likelyC, max: maxC };

  return {
    score,
    scoreBand: scoreToBand(score),
    lifecycleFlags: flags,
    costBand,
    negotiationChecklist: buildChecklist(flags),
  };
}
