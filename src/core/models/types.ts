// ─── Enums (stored as string literals) ───────────────────────────────────────

export type Byggnadstyp =
  | 'enplanshus'
  | 'tvåplanshus'
  | 'suterrang'
  | 'parhus'
  | 'kedjehus'
  | 'radhus'
  | 'other';

export type YttertakType =
  | 'takpapp'
  | 'gummiduk'
  | 'betongpannor'
  | 'tegeltak'
  | 'plattak'
  | 'other';

export type FasadType = 'tegel' | 'tra' | 'puts' | 'blandad';

export type Grundlaeggning =
  | 'betongplatta'
  | 'krypgrund'
  | 'kallare'
  | 'suterrang'
  | 'other';

export type Uppvarmning =
  | 'bergvarme'
  | 'luftvarmepump'
  | 'fjärrvärme'
  | 'direktverkandeEl'
  | 'pellets'
  | 'ved'
  | 'olja'
  | 'other';

export type Ventilation = 'ftxMekanisk' | 'fMekanisk' | 'sjalvdrag';

export type LifecycleComponent =
  | 'roof'
  | 'facade'
  | 'grund'
  | 'vatrum'
  | 'ventilation'
  | 'uppvarmning';

// ─── Condition levels (traffic-light) ────────────────────────────────────────

export type ConditionLevel = 'ok' | 'attention' | 'priority';

export interface ComponentCondition {
  component: LifecycleComponent;
  level: ConditionLevel;
  messageKey: string;
  triggeredBy: string[];
  ageYears?: number;      // for lifetime analysis
  lifespanYears?: number; // for lifetime analysis
}

export interface GreenSignal {
  messageKey: string;
}

export interface CostBand {
  min: number;
  likely: number;
  max: number;
}

export interface ConditionOutput {
  componentConditions: ComponentCondition[]; // always 6, one per component
  costBand: CostBand;
  viewingTips: string[];    // i18n keys
  greenSignals: GreenSignal[];
}

// ─── Data models ─────────────────────────────────────────────────────────────

export interface HouseInputs {
  // Required
  byggnadstyp: Byggnadstyp;
  byggnadsar: number;
  size: number; // m²
  grundlaeggning: Grundlaeggning;
  yttertakType: YttertakType;
  yttertakAge: number;
  fasadType: FasadType;
  fasadAge: number;
  uppvarmning: Uppvarmning;
  ventilation: Ventilation;
  // Optional
  houseLabel?: string;
  draneringAge?: number;
  vatrumAge?: number;
}

export interface Report {
  id: string;
  houseLabel: string;
  inputs: HouseInputs;
  outputs: ConditionOutput;
  timestamp: string; // ISO 8601
  modelVersion: string;
}

export interface AppSettings {
  locale: 'en' | 'sv';
  purchased: boolean;
  themeMode: 'system' | 'light' | 'dark';
}

// ─── Deprecated (kept for migration reference only) ──────────────────────────
// @deprecated Use ConditionLevel instead
export type FlagLevel = 'risk' | 'highRisk';
// @deprecated Use ConditionLevel instead
export type ScoreBand = 'low' | 'medium' | 'high';
// @deprecated Use ConditionOutput instead
export interface LifecycleFlag {
  component: LifecycleComponent;
  level: FlagLevel;
  triggeredBy: string[];
  contributionPercent: number;
  messageKey: string;
}
// @deprecated Use ConditionOutput instead
export interface RiskOutput {
  score: number;
  scoreBand: ScoreBand;
  lifecycleFlags: LifecycleFlag[];
  costBand: CostBand;
  negotiationChecklist: string[];
}
