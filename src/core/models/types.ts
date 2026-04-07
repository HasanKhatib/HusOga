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

export type FlagLevel = 'risk' | 'highRisk';

export type ScoreBand = 'low' | 'medium' | 'high';

export type LifecycleComponent =
  | 'roof'
  | 'facade'
  | 'drainage'
  | 'ventilation'
  | 'heating'
  | 'wetRooms';

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

export interface LifecycleFlag {
  component: LifecycleComponent;
  level: FlagLevel;
  triggeredBy: string[];
  contributionPercent: number;
  messageKey: string;
}

export interface CostBand {
  min: number;
  likely: number;
  max: number;
}

export interface RiskOutput {
  score: number;
  scoreBand: ScoreBand;
  lifecycleFlags: LifecycleFlag[];
  costBand: CostBand;
  negotiationChecklist: string[];
}

export interface Report {
  id: string;
  houseLabel: string;
  inputs: HouseInputs;
  outputs: RiskOutput;
  timestamp: string; // ISO 8601
  modelVersion: string;
}

export interface AppSettings {
  locale: 'en' | 'sv';
  purchased: boolean;
  themeMode: 'system' | 'light' | 'dark';
}
