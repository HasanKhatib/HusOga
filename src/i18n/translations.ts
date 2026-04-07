import { I18n } from 'i18n-js';

const en = {
  // App
  appName: 'HusÖga',
  appSlogan: 'Know what you\'re buying',

  // Navigation / screens
  reports: 'Reports',
  houseData: 'House Data',
  result: 'Result',
  settings: 'Settings',
  newAssessment: 'New assessment',

  // Report list
  noReportsYet: 'No reports yet',
  createFirstAssessment: 'Tap + to create your first assessment',
  createReport: 'Create report',
  score: 'Score',
  report: 'Report',
  deleteReportTitle: 'Delete report',
  deleteToAddAnother: 'Delete an existing report to create a new one (free tier)',
  cancel: 'Cancel',
  delete: 'Delete',
  removeReport: 'Remove "%{label}"?',
  reportNotFound: 'Report not found',

  // Form fields
  address: 'Address / label',
  addressHint: 'e.g. Storgatan 12, Stockholm',
  buildingType: 'Building type',
  buildYear: 'Build year',
  buildYearHint: 'e.g. 1978',
  livingArea: 'Living area (m²)',
  livingAreaHint: 'e.g. 120',
  foundation: 'Foundation',
  roofType: 'Roof type',
  roofAge: 'Roof age (years)',
  facadeType: 'Facade type',
  facadeAge: 'Years since last paint / refurb',
  heating: 'Heating system',
  ventilation: 'Ventilation',
  drainageAge: 'Drainage age (years, optional)',
  wetRoomsAge: 'Wet rooms age (years, optional)',
  calculate: 'Calculate',
  calculateRisk: 'Calculate Risk',
  requiredFields: 'Required Fields',
  optionalFields: 'Optional Fields',

  // Building types
  enplanshus: 'Single-storey house',
  'tvåplanshus': 'Two-storey house',
  suterrang: 'Suterrang',
  parhus: 'Semi-detached',
  kedjehus: 'Terraced house',
  radhus: 'Row house',
  other: 'Other',

  // Roof types
  takpapp: 'Felt / tar paper',
  gummiduk: 'EPDM rubber membrane',
  betongpannor: 'Concrete tiles',
  tegeltak: 'Clay tiles',
  plattak: 'Metal sheet',

  // Facade types
  tegel: 'Brick',
  tra: 'Wood / timber',
  puts: 'Render / plaster',
  blandad: 'Mixed',

  // Foundation types
  betongplatta: 'Concrete slab',
  krypgrund: 'Crawl space',
  kallare: 'Basement',
  grundlaeggning_suterrang: 'Suterrang basement',
  grundlaeggning_other: 'Other',

  // Heating types
  bergvarme: 'Ground source heat pump',
  luftvarmepump: 'Air source heat pump',
  'fjärrvärme': 'District heating',
  direktverkandeEl: 'Direct electric',
  pellets: 'Pellets',
  ved: 'Wood / log',
  olja: 'Oil',
  uppvarmning_other: 'Other',

  // Ventilation types
  ftxMekanisk: 'Mechanical FTX (balanced)',
  fMekanisk: 'Mechanical exhaust only',
  sjalvdrag: 'Natural draught',

  // Score bands
  low: 'Low risk',
  medium: 'Medium risk',
  high: 'High risk',

  // Risk flags
  roofRisk: 'Roof approaching end of lifespan',
  roofHighRisk: 'Roof overdue for replacement',
  facadeRisk: 'Facade approaching end of lifespan',
  facadeHighRisk: 'Facade overdue for refurbishment',
  drainageRisk: 'Drainage approaching end of lifespan',
  drainageHighRisk: 'Drainage overdue for replacement',
  ventilationRisk: 'Natural draught ventilation – high moisture risk',
  heatingRisk: 'Direct electric heating – high operating cost',
  wetRoomsRisk: 'Wet rooms approaching end of lifespan',
  wetRoomsHighRisk: 'Wet rooms overdue for renovation',
  betongplatta70s: '1960s–80s concrete slab – elevated drainage risk',

  // Checklist items
  askSellerRoofFacadeDrainage: 'Ask seller for invoices: roof, facade, drainage',
  demandBuyerInspection: 'Commission an independent buyer\'s inspection (överlåtelsebesiktning)',
  betongplatta70sCheck: 'Inspect drainage and radon – known issue for 1965–1985 concrete slabs',
  vatrumCheck: 'Request wet room inspection protocol',
  roofSnowCheck: 'Check roof load capacity and snow guard status',

  // Result screen
  costEstimate: 'Cost estimate (5–10 years)',
  lifecycleFlags: 'Lifecycle Flags',
  minCost: 'Min',
  likelyCost: 'Likely',
  maxCost: 'Max',
  negotiationChecklist: 'Negotiation checklist',
  disclaimer: 'This assessment is not a replacement for a professional inspection. HusÖga is not affiliated with Boverket or Folkhälsomyndigheten.',

  // Settings
  language: 'Language',
  languageSwedish: 'Swedish',
  languageEnglish: 'English',
  devUnlock: 'Unlock paid features (dev)',
  purchaseStatus: 'Purchase Status',
  freeOneReport: 'Free (1 report)',
  paidUnlimited: 'Paid (unlimited)',
  upgradeForUnlimited: 'Upgrade for unlimited reports',
  upgrade: 'Upgrade',
  restorePurchases: 'Restore Purchases',
  upgraded: 'Upgraded',
  restoreNotImplemented: 'Restore purchases not implemented yet',

  // Errors
  required: 'Required',
};

const sv: typeof en = {
  appName: 'HusÖga',
  appSlogan: 'Vet vad du köper',

  reports: 'Rapporter',
  houseData: 'Husdata',
  result: 'Resultat',
  settings: 'Inställningar',
  newAssessment: 'Ny bedömning',

  noReportsYet: 'Inga rapporter än',
  createFirstAssessment: 'Tryck på + för att göra din första bedömning',
  createReport: 'Skapa rapport',
  score: 'Poäng',
  report: 'Rapport',
  deleteReportTitle: 'Ta bort rapport',
  deleteToAddAnother: 'Ta bort en befintlig rapport för att skapa en ny (gratisversion)',
  cancel: 'Avbryt',
  delete: 'Ta bort',
  removeReport: 'Ta bort "%{label}"?',
  reportNotFound: 'Rapporten hittades inte',

  address: 'Adress / etikett',
  addressHint: 't.ex. Storgatan 12, Stockholm',
  buildingType: 'Hustyp',
  buildYear: 'Byggår',
  buildYearHint: 't.ex. 1978',
  livingArea: 'Boarea (m²)',
  livingAreaHint: 't.ex. 120',
  foundation: 'Grundläggning',
  roofType: 'Taktyp',
  roofAge: 'Takålder (år)',
  facadeType: 'Fasadtyp',
  facadeAge: 'År sedan målning/omputs',
  heating: 'Uppvärmning',
  ventilation: 'Ventilation',
  drainageAge: 'Dräneringens ålder (år, valfritt)',
  wetRoomsAge: 'Våtrummens ålder (år, valfritt)',
  calculate: 'Beräkna',
  calculateRisk: 'Beräkna risk',
  requiredFields: 'Obligatoriska fält',
  optionalFields: 'Valfria fält',

  enplanshus: 'Enplanshus',
  'tvåplanshus': 'Tvåplanshus',
  suterrang: 'Suterräng',
  parhus: 'Parhus',
  kedjehus: 'Kedjehus',
  radhus: 'Radhus',
  other: 'Annat',

  takpapp: 'Takpapp',
  gummiduk: 'Gummiduk (EPDM)',
  betongpannor: 'Betongpannor',
  tegeltak: 'Tegelpannor',
  plattak: 'Plåttak',

  tegel: 'Tegel',
  tra: 'Trä',
  puts: 'Puts',
  blandad: 'Blandad',

  betongplatta: 'Betongplatta',
  krypgrund: 'Krypgrund',
  kallare: 'Källare',
  grundlaeggning_suterrang: 'Suterräng',
  grundlaeggning_other: 'Annat',

  bergvarme: 'Bergvärme',
  luftvarmepump: 'Luftvärmepump',
  'fjärrvärme': 'Fjärrvärme',
  direktverkandeEl: 'Direktverkande el',
  pellets: 'Pellets',
  ved: 'Ved',
  olja: 'Olja',
  uppvarmning_other: 'Annat',

  ftxMekanisk: 'Mekanisk FTX (balanserad)',
  fMekanisk: 'Mekanisk frånluft',
  sjalvdrag: 'Självdrag',

  low: 'Låg risk',
  medium: 'Medelhög risk',
  high: 'Hög risk',

  roofRisk: 'Taket närmar sig livslängdens slut',
  roofHighRisk: 'Taket är försenat för byte',
  facadeRisk: 'Fasaden närmar sig livslängdens slut',
  facadeHighRisk: 'Fasaden är försenad för renovering',
  drainageRisk: 'Dräneringen närmar sig livslängdens slut',
  drainageHighRisk: 'Dräneringen är försenad för byte',
  ventilationRisk: 'Självdrag – hög fuktrisknivå',
  heatingRisk: 'Direktverkande el – höga driftkostnader',
  wetRoomsRisk: 'Våtrummen närmar sig livslängdens slut',
  wetRoomsHighRisk: 'Våtrummen är försenade för renovering',
  betongplatta70s: 'Betongplatta från 60–80-tal – förhöjd dräneringsrisk',

  askSellerRoofFacadeDrainage: 'Begär kvitton: tak, fasad, dränering',
  demandBuyerInspection: 'Beställ en överlåtelsebesiktning',
  betongplatta70sCheck: 'Kontrollera dränering och radon – känt problem för betongplattor 1965–1985',
  vatrumCheck: 'Begär våtrumsinspektionsprotokoll',
  roofSnowCheck: 'Kontrollera bärförmåga och snöräcken',

  costEstimate: 'Kostnadsbedömning (5–10 år)',
  lifecycleFlags: 'Livslängdsflaggor',
  minCost: 'Min',
  likelyCost: 'Troligt',
  maxCost: 'Max',
  negotiationChecklist: 'Förhandlingschecklista',
  disclaimer: 'Denna bedömning ersätter inte en professionell besiktning. HusÖga är inte kopplat till Boverket eller Folkhälsomyndigheten.',

  language: 'Språk',
  languageSwedish: 'Svenska',
  languageEnglish: 'Engelska',
  devUnlock: 'Lås upp betalfunktioner (dev)',
  purchaseStatus: 'Köpstatus',
  freeOneReport: 'Gratis (1 rapport)',
  paidUnlimited: 'Betald (obegränsat)',
  upgradeForUnlimited: 'Uppgradera för obegränsat antal rapporter',
  upgrade: 'Uppgradera',
  restorePurchases: 'Återställ köp',
  upgraded: 'Uppgraderad',
  restoreNotImplemented: 'Återställning av köp är inte implementerat än',

  required: 'Obligatoriskt',
};

export const i18n = new I18n({ en, sv });
i18n.enableFallback = true;
i18n.defaultLocale = 'sv';

export type TranslationKeys = keyof typeof en;
