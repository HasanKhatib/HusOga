import type {
  HouseInputs,
  ConditionOutput,
  ComponentCondition,
  ConditionLevel,
  GreenSignal,
  CostBand,
} from '../models/types';
import { roofLifespans, fasadLifespans, drainageLifespan, vatrumLifespan } from '../data/lifespans';
import { roofCosts, fasadCostPerSqm, drainageCost, vatrumCost } from '../data/costs';

export const MODEL_VERSION = '2.0.0';

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Continuous deterioration curve: ratio=age/lifespan → condition in [0..1].
 * Accelerates near end-of-life while staying continuous.
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

// ─── Condition level thresholds ───────────────────────────────────────────────

function levelFromCondition(c: number, isTypeOnly = false): ConditionLevel {
  // Type-only components (ventilation, uppvarmning) have lower thresholds
  // because their condition is based on type, not age deterioration.
  if (isTypeOnly) {
    if (c >= 0.45) return 'priority';
    if (c >= 0.2)  return 'attention';
    return 'ok';
  }
  if (c >= 0.7) return 'priority';
  if (c >= 0.4) return 'attention';
  return 'ok';
}

// ─── Component condition calculators ─────────────────────────────────────────

function roofCondition(inputs: HouseInputs): ComponentCondition {
  const lifespan = roofLifespans[inputs.yttertakType] ?? roofLifespans.other;
  const c = clamp01(conditionFromRatio(inputs.yttertakAge / lifespan));
  const level = levelFromCondition(c);
  const messageKey =
    level === 'priority' ? 'roofPriority' :
    level === 'attention' ? 'roofAttention' : 'roofOk';
  return {
    component: 'roof',
    level,
    messageKey,
    triggeredBy: ['yttertakType', 'yttertakAge'],
    ageYears: inputs.yttertakAge,
    lifespanYears: lifespan,
  };
}

function facadeCondition(inputs: HouseInputs): ComponentCondition {
  const lifespan = fasadLifespans[inputs.fasadType];
  // Tegel has no practical lifespan — always ok
  if (lifespan == null) {
    return {
      component: 'facade',
      level: 'ok',
      messageKey: 'facadeOk',
      triggeredBy: ['fasadType'],
    };
  }
  const c = clamp01(conditionFromRatio(inputs.fasadAge / lifespan));
  const level = levelFromCondition(c);
  const messageKey =
    level === 'priority' ? 'facadePriority' :
    level === 'attention' ? 'facadeAttention' : 'facadeOk';
  return {
    component: 'facade',
    level,
    messageKey,
    triggeredBy: ['fasadType', 'fasadAge'],
    ageYears: inputs.fasadAge,
    lifespanYears: lifespan,
  };
}

function grundCondition(inputs: HouseInputs): ComponentCondition {
  const slab70s =
    inputs.byggnadsar >= 1965 &&
    inputs.byggnadsar <= 1985 &&
    inputs.grundlaeggning === 'betongplatta';

  let c: number;
  const triggeredBy: string[] = ['grundlaeggning'];

  if (inputs.draneringAge != null) {
    // Use drainage age as primary condition, amplified for slab70s
    c = clamp01(conditionFromRatio(inputs.draneringAge / drainageLifespan));
    triggeredBy.push('draneringAge');
    if (slab70s) {
      c = clamp01(c * 1.15);
      triggeredBy.push('byggnadsar');
    }
  } else {
    // No drainage age: base on foundation type
    const baseConditions: Record<string, number> = {
      betongplatta: 0.3,
      krypgrund: 0.5,
      kallare: 0.35,
      suterrang: 0.4,
      other: 0.25,
    };
    c = baseConditions[inputs.grundlaeggning] ?? 0.25;
    if (slab70s) {
      // 70s concrete slab is a known drainage risk even without age data
      c = Math.max(c, 0.45);
      triggeredBy.push('byggnadsar');
    }
  }

  const level = levelFromCondition(c);
  let messageKey: string;
  if (slab70s && level !== 'ok') {
    messageKey = 'grundSlab70s';
  } else {
    messageKey =
      level === 'priority' ? 'grundPriority' :
      level === 'attention' ? 'grundAttention' : 'grundOk';
  }

  return {
    component: 'grund',
    level,
    messageKey,
    triggeredBy,
    ageYears: inputs.draneringAge,
    lifespanYears: inputs.draneringAge != null ? drainageLifespan : undefined,
  };
}

function vatrumCondition(inputs: HouseInputs): ComponentCondition {
  if (inputs.vatrumAge == null) {
    return {
      component: 'vatrum',
      level: 'ok',
      messageKey: 'vatrumUnknown',
      triggeredBy: [],
    };
  }

  const slab70s =
    inputs.byggnadsar >= 1965 &&
    inputs.byggnadsar <= 1985 &&
    inputs.grundlaeggning === 'betongplatta';

  const triggeredBy: string[] = ['vatrumAge'];
  let c = clamp01(conditionFromRatio(inputs.vatrumAge / vatrumLifespan));

  if (slab70s) {
    c = clamp01(c * 1.05);
    triggeredBy.push('byggnadsar', 'grundlaeggning');
  }
  if (inputs.ventilation === 'sjalvdrag') {
    c = clamp01(c * 1.1);
    triggeredBy.push('ventilation');
  }

  const level = levelFromCondition(c);
  const messageKey =
    level === 'priority' ? 'vatrumPriority' :
    level === 'attention' ? 'vatrumAttention' : 'vatrumOk';

  return {
    component: 'vatrum',
    level,
    messageKey,
    triggeredBy,
    ageYears: inputs.vatrumAge,
    lifespanYears: vatrumLifespan,
  };
}

function ventilationConditionFor(inputs: HouseInputs): ComponentCondition {
  const conditionValues: Record<string, number> = {
    sjalvdrag: 0.55,
    fMekanisk: 0.2,
    ftxMekanisk: 0.1,
  };
  const c = conditionValues[inputs.ventilation] ?? 0.1;
  const level = levelFromCondition(c, true);
  const messageKey =
    level === 'priority' ? 'ventilationPriority' :
    level === 'attention' ? 'ventilationAttention' : 'ventilationOk';
  return {
    component: 'ventilation',
    level,
    messageKey,
    triggeredBy: ['ventilation'],
  };
}

function uppvarmningConditionFor(inputs: HouseInputs): ComponentCondition {
  const conditionValues: Record<string, number> = {
    direktverkandeEl: 0.45,
    olja: 0.35,
    ved: 0.2,
    pellets: 0.15,
    luftvarmepump: 0.1,
    'fjärrvärme': 0.1,
    bergvarme: 0.05,
    other: 0.2,
  };
  const c = conditionValues[inputs.uppvarmning] ?? 0.2;
  const level = levelFromCondition(c, true);
  const messageKey =
    level === 'priority' ? 'uppvarmningPriority' :
    level === 'attention' ? 'uppvarmningAttention' : 'uppvarmningOk';
  return {
    component: 'uppvarmning',
    level,
    messageKey,
    triggeredBy: ['uppvarmning'],
  };
}

// ─── Viewing tips ─────────────────────────────────────────────────────────────

function buildViewingTips(inputs: HouseInputs): string[] {
  const tips: string[] = [];
  const slab70s =
    inputs.byggnadsar >= 1965 &&
    inputs.byggnadsar <= 1985 &&
    inputs.grundlaeggning === 'betongplatta';

  if (inputs.byggnadsar < 1960) tips.push('tipOldHouseFoundation');
  if (slab70s) tips.push('tipSlab70s');
  if (inputs.grundlaeggning === 'krypgrund') tips.push('tipCrawlSpace');
  if (inputs.ventilation === 'sjalvdrag') tips.push('tipNaturalDraught');
  if (inputs.yttertakAge > (roofLifespans[inputs.yttertakType] ?? 30) * 0.6) tips.push('tipOldRoof');
  if (inputs.vatrumAge != null && inputs.vatrumAge > vatrumLifespan * 0.6) tips.push('tipOldWetRooms');
  if (inputs.uppvarmning === 'direktverkandeEl') tips.push('tipDirectElectric');
  if (inputs.uppvarmning === 'olja') tips.push('tipOilHeating');

  // Always include at least 2 generic tips if list is short
  if (tips.length < 2) tips.push('tipCheckMoisture');
  if (tips.length < 3) tips.push('tipAskForInvoices');

  return tips.slice(0, 6); // cap at 6
}

// ─── Green signals ────────────────────────────────────────────────────────────

function buildGreenSignals(inputs: HouseInputs): GreenSignal[] {
  const signals: GreenSignal[] = [];

  if (inputs.uppvarmning === 'bergvarme') signals.push({ messageKey: 'greenBergvarme' });
  if (inputs.uppvarmning === 'fjärrvärme') signals.push({ messageKey: 'greenFjärrvärme' });
  if (inputs.uppvarmning === 'luftvarmepump') signals.push({ messageKey: 'greenLuftvarmepump' });
  if (inputs.ventilation === 'ftxMekanisk') signals.push({ messageKey: 'greenFtx' });
  if (inputs.fasadType === 'tegel') signals.push({ messageKey: 'greenTegelFasad' });
  if (inputs.yttertakType === 'tegeltak' || inputs.yttertakType === 'plattak') {
    signals.push({ messageKey: 'greenDurableRoof' });
  }

  return signals;
}

// ─── Decision points ──────────────────────────────────────────────────────────

export function buildDecisionPoints(conditions: ComponentCondition[]): string[] {
  const points: string[] = ['demandBuyerInspection'];

  const hasDrainage = conditions.some(
    (c) => c.component === 'grund' && c.level !== 'ok'
  );
  const hasVatrum = conditions.some(
    (c) => c.component === 'vatrum' && c.level !== 'ok'
  );
  const hasRoof = conditions.some(
    (c) => c.component === 'roof' && c.level !== 'ok'
  );
  const hasFacade = conditions.some(
    (c) => c.component === 'facade' && c.level !== 'ok'
  );
  const hasSlab70s = conditions.some(
    (c) => c.component === 'grund' && c.messageKey === 'grundSlab70s'
  );

  if (hasRoof || hasFacade || hasDrainage) points.push('askSellerInvoices');
  if (hasSlab70s) points.push('betongplatta70sCheck');
  if (hasVatrum) points.push('vatrumCheck');
  if (hasRoof) points.push('roofSnowCheck');

  return points;
}

// ─── Cost band ────────────────────────────────────────────────────────────────

function buildCostBand(
  inputs: HouseInputs,
  conditions: ComponentCondition[]
): CostBand {
  const costMins: number[] = [];
  const costLikelys: number[] = [];
  const costMaxs: number[] = [];

  function addCost(range: [number, number]) {
    costMins.push(range[0]);
    costLikelys.push(Math.round((range[0] + range[1]) / 2));
    costMaxs.push(range[1]);
  }

  for (const cc of conditions) {
    if (cc.level === 'ok') continue;
    if (cc.component === 'roof') {
      addCost(roofCosts[inputs.yttertakType] ?? roofCosts.other);
    }
    if (cc.component === 'grund') {
      // Only add drainage cost if we have concrete age data or slab70s rule triggered
      const hasDrainageAge = inputs.draneringAge != null;
      const isSlab70s = cc.messageKey === 'grundSlab70s';
      if (hasDrainageAge || isSlab70s) addCost(drainageCost);
    }
    if (cc.component === 'vatrum' && inputs.vatrumAge != null) {
      addCost(vatrumCost);
    }
    if (cc.component === 'facade') {
      const cp = fasadCostPerSqm[inputs.fasadType] ?? 1500;
      if (cp > 0) {
        const cost = Math.round(inputs.size * cp);
        addCost([Math.round(cost * 0.8), Math.round(cost * 1.2)]);
      }
    }
  }

  return {
    min: costMins.reduce((a, b) => a + b, 0),
    likely: costLikelys.reduce((a, b) => a + b, 0),
    max: costMaxs.reduce((a, b) => a + b, 0),
  };
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function computeRisk(inputs: HouseInputs): ConditionOutput {
  const componentConditions: ComponentCondition[] = [
    roofCondition(inputs),
    facadeCondition(inputs),
    grundCondition(inputs),
    vatrumCondition(inputs),
    ventilationConditionFor(inputs),
    uppvarmningConditionFor(inputs),
  ];

  return {
    componentConditions,
    costBand: buildCostBand(inputs, componentConditions),
    viewingTips: buildViewingTips(inputs),
    greenSignals: buildGreenSignals(inputs),
  };
}
