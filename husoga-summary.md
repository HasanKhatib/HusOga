# HusÖga — Codebase Summary

Flutter mobile app (offline, Hive storage) for Swedish pre-purchase villa risk assessment.  
No backend. No accounts. No network calls.

---

## What It Does

The user enters basic building data and gets back:
- A **risk score** (0–100, banded Low / Medium / High)
- **Lifecycle flags** per component (roof, facade, drainage, heating, ventilation, wet rooms), each showing which inputs triggered it and its % contribution to the score
- A **5–10 year cost exposure band** (min / likely / max in SEK)
- A **negotiation checklist** of questions to raise with the seller

---

## Project Structure

```
lib/
├── main.dart                          # Hive init + adapter registration + runApp
├── app.dart                           # MaterialApp, locale, GlobalKey<NavigatorState>
├── l10n/app_en.arb, app_sv.arb        # Localization strings (103 keys)
├── core/
│   ├── models/                        # Hive-annotated data models
│   ├── services/
│   │   ├── risk_engine.dart           # Pure static risk computation
│   │   ├── storage_service.dart       # Hive CRUD (box: 'reports')
│   │   ├── settings_service.dart      # Hive boxes: 'app_settings', 'dev_settings'
│   │   └── purchase_service.dart      # Free=1 report / paid=unlimited (IAP STUB)
│   ├── data/
│   │   ├── lifespans.dart             # Component lifespans in years
│   │   └── costs.dart                 # Replacement cost ranges in SEK
│   └── validation.dart                # HouseInputsValidator
└── features/
    ├── reports/
    │   ├── report_list_screen.dart    # Home; list + delete + create
    │   ├── report_form_screen.dart    # Data entry; 500ms debounce; Calculate button
    │   └── report_result_screen.dart  # Score, flags, cost band, checklist
    └── settings/
        └── settings_screen.dart       # Language picker; dev unlock (debug only)
```

---

## Data Models

### `Report` (Hive typeId: 0)

```dart
@HiveType(typeId: 0)
class Report {
  final String id;           // UUID
  final String houseLabel;   // address / user label
  final HouseInputs inputs;
  final RiskOutput outputs;
  final DateTime timestamp;
  final String modelVersion; // '1.0.0' — stored to detect stale assessments
}
```

### `HouseInputs` (Hive typeId: 4)

```dart
@HiveType(typeId: 4)
class HouseInputs {
  // Required (10)
  final String byggnadstyp;    // enum string: 'enplanshus', 'tvåplanshus', etc.
  final int byggnadsar;        // build year
  final double size;           // living area m²
  final String grundlaeggning; // enum: 'betongplatta', 'krypgrund', etc.
  final String yttertakType;   // enum: 'takpapp', 'betongpannor', 'tegeltak', etc.
  final int yttertakAge;       // years since roof installed/replaced
  final String fasadType;      // enum: 'tegel', 'tra', 'puts', 'blandad'
  final int fasadAge;          // years since last facade work
  final String uppvarmning;    // enum: 'bergvarme', 'direktverkandeEl', etc.
  final String ventilation;    // enum: 'ftxMekanisk', 'fMekanisk', 'sjalvdrag'

  // Optional (11) — not yet surfaced in the form UI
  final String? houseLabel;
  final String? stomme;
  final String? siteType;
  final int? hangrannorAge;
  final String? fonsterType;
  final int? fonsterAge;
  final int? draneringAge;      // used by engine if provided
  final int? vatrumAge;         // used by engine if provided
  final bool? skorsten;
  final int? skorstenSealAge;
  final int? luftvarmepumpAge;
}
```

### `RiskOutput` (Hive typeId: 3)

```dart
@HiveType(typeId: 3)
class RiskOutput {
  final int score;                        // 0–100
  final String scoreBand;                 // 'low' | 'medium' | 'high'
  final List<LifecycleFlag> lifecycleFlags;
  final CostBand costBand;
  final List<String> negotiationChecklist; // l10n keys
}
```

### `LifecycleFlag` (Hive typeId: 2)

```dart
@HiveType(typeId: 2)
class LifecycleFlag {
  final String component;           // 'roof' | 'facade' | 'drainage' | etc.
  final String level;               // 'risk' | 'highRisk'
  final List<String> triggeredBy;   // input field names that caused the flag
  final int contributionPercent;    // % of total score this flag contributes
  final String messageKey;          // l10n key for the displayed message
}
```

---

## Risk Engine (`lib/core/services/risk_engine.dart`)

Pure static Dart. No dependencies on Hive or Flutter.

```dart
const String modelVersion = '1.0.0';

class RiskEngine {
  static const double _riskThreshold     = 0.7;
  static const double _highRiskThreshold = 0.9;

  static RiskOutput compute(HouseInputs inputs) { ... }
}
```

### Scoring Logic

| Component | Trigger | Points (risk / highRisk) | Cost source |
|---|---|---|---|
| Roof | `yttertakAge / roofLifespan` | +15 / +25 | `roofCosts` map |
| Facade | `fasadAge / fasadLifespan` (tegel skipped) | +12 / +20 | `fasadCostPerSqm × size` |
| Drainage | `draneringAge / 25` (optional input) | +8 / +15 | 130k–200k SEK |
| Ventilation | `ventilation == 'sjalvdrag'` → always flags | +10 | none |
| Heating | `uppvarmning == 'direktverkandeEl'` → always flags | +8 | none |
| Wet rooms | `vatrumAge / 20` (optional input) | +6 / +12 | 50k–150k SEK |
| **Special rule** | `byggnadsar` 1965–1985 + `grundlaeggning == 'betongplatta'` → auto drainage flag (if no drainage flag already exists) | +10 | 130k–200k SEK |

**Score bands:** `< 30` → low, `< 60` → medium, `≥ 60` → high. Score clamped to 0–100.

**Cost aggregation:** All triggered components summed independently (min / likely / max). `likely = (min + max) / 2`.

**Checklist:** Always includes 2 base items + conditional items per triggered component.

### Lifespan Data (`lib/core/data/lifespans.dart`)

```dart
const Map<String, int> roofLifespans = {
  'takpapp': 20, 'gummiduk': 30, 'betongpannor': 30,
  'tegeltak': 30, 'plattak': 35, 'other': 30,
};

const Map<String, int?> fasadLifespans = {
  'tegel': null, // no replacement — engine skips facade check
  'tra': 40, 'puts': 30, 'blandad': 30,
};

const int drainageLifespan = 25;
const int vatrumLifespan   = 20;
// Also defined but NOT wired into engine yet:
// guttersLifespan=25, fonsterLifespans, chimneySealLifespan=40, heatPumpLifespan=8
```

### Cost Data (`lib/core/data/costs.dart`)

```dart
const Map<String, (int, int)> roofCosts = {
  'takpapp': (80000, 150000), 'gummiduk': (100000, 200000),
  'betongpannor': (150000, 300000), 'tegeltak': (150000, 300000),
  'plattak': (100000, 250000), 'other': (100000, 250000),
};
const Map<String, int> fasadCostPerSqm = {
  'tegel': 0, 'tra': 800, 'puts': 2500, 'blandad': 1500,
};
const (int, int) drainageCost = (130000, 200000);
const (int, int) vatrumCost   = (50000, 150000);
// Also defined but NOT wired into engine yet:
// guttersCost, chimneySealCostPerM
```

---

## Services

### `StorageService`

```dart
class StorageService {
  Future<void>        saveReport(Report report);
  Future<Report?>     getReport(String id);
  Future<List<Report>> listReports();   // sorted newest first
  Future<void>        deleteReport(String id);
}
```

### `PurchaseService` (IAP stub)

```dart
class PurchaseService {
  static const int freeReportLimit = 1;

  Future<bool> canCreateReport(int currentReportCount);

  /// STUB — sets a bool flag only. No real IAP integrated.
  Future<void> unlockPurchased();
}
```

---

## Input Validation (`lib/core/validation.dart`)

```dart
class HouseInputsValidator {
  // Build year: 1800 – current year
  static String? validateBuildYear(int? value);
  // Area: 10 – 2000 m²
  static String? validateArea(double? value);
  // Ages: 0 – 150
  static String? validateAge(int? value);
  // Address: max 200 chars
  static String? validateAddress(String? value);
  // Validates all required numeric fields; returns Map<field, errorMessage>
  static Map<String, String> validateNumeric({ int? byggnadsar, double? size, ... });
}
```

---

## Key Screen Logic

### `ReportFormScreen`

- **New report:** user fills form → taps Calculate → validate → `RiskEngine.compute` → `StorageService.saveReport` → push `ReportResultScreen`
- **Edit report:** fields pre-populated from Hive → any change → 500ms debounce → auto-validate → auto-compute → auto-save
- Currently exposes only the 8 **required** fields. The 11 optional fields (`draneringAge`, `vatrumAge`, etc.) exist in the model but have no form widgets yet.

### `ReportListScreen`

- Free tier: `canCreateReport(count)` returns false if count ≥ 1 and not purchased → shows Snackbar. No upgrade/purchase UI exists yet.
- Delete with confirmation dialog.

---

## Hive Setup

```dart
// main.dart
await Hive.initFlutter();
Hive.registerAdapter(ReportAdapter());
Hive.registerAdapter(HouseInputsAdapter());
Hive.registerAdapter(RiskOutputAdapter());
Hive.registerAdapter(LifecycleFlagAdapter());
Hive.registerAdapter(CostBandAdapter());
Hive.registerAdapter(AppSettingsAdapter());
```

**`*.g.dart` adapter files are gitignored.** After cloning, run:
```bash
flutter pub run build_runner build
```

| Hive Box | Name | Type |
|---|---|---|
| Reports | `'reports'` | `Box<Report>` |
| App Settings | `'app_settings'` | `Box<AppSettings>` |
| Dev Settings | `'dev_settings'` | `Box<dynamic>` |

---

## What Is Missing / Stubbed

| Gap | Details |
|---|---|
| **IAP not implemented** | `PurchaseService.unlockPurchased()` sets a bool. No `in_app_purchase` package. Required before App Store release. |
| **Optional form fields not in UI** | `draneringAge` and `vatrumAge` are used by the engine but users can't enter them. The only drainage check possible via UI is the auto-rule (1965–1985 + betongplatta). |
| **6 data definitions unused** | `guttersLifespan`, `fonsterLifespans`, `chimneySealLifespan`, `heatPumpLifespan`, `guttersCost`, `chimneySealCostPerM` are defined but the engine never reads them. |
| **No upgrade UI** | Free-tier limit hit shows a Snackbar. No purchase button or screen. `upgradeToUnlimit` l10n key exists but is unused. |
| **No stale-report detection** | `modelVersion` is stored per report but never compared on load. |
| **Two hint texts hardcoded in Swedish** | Roof age and facade age field hints bypass localization — English users see Swedish. |
| **`triggeredBy` shows raw Dart field names** | e.g. `yttertakType, yttertakAge` displayed to the user as-is, not localized labels. |
| **No widget tests** | All three screens have zero automated UI test coverage. |

---

## Legal Constraints (non-negotiable)

Every release must display:
> *"Not a replacement for professional inspection."*
> *"Not affiliated with Boverket/Folkhälsomyndigheten."*

Never claim "BBR-compliant", "Official risk rating", or "Approved".
