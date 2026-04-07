import type { HouseInputs, RiskOutput, LifecycleFlag, CostBand, ScoreBand } from '../models/types';
import { roofLifespans, fasadLifespans, drainageLifespan, vatrumLifespan } from '../data/lifespans';
import { roofCosts, fasadCostPerSqm, drainageCost, vatrumCost } from '../data/costs';

export const MODEL_VERSION = '1.0.0';

const RISK_THRESHOLD = 0.7;
const HIGH_RISK_THRESHOLD = 0.9;

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

export function computeRisk(inputs: HouseInputs): RiskOutput {
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
