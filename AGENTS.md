# AGENTS.md — house-risk-snapshot (HusÖga)

Flutter mobile app for Swedish pre-purchase villa risk assessment. No backend, no accounts, no cloud sync. All data stored locally on-device via Hive.

---

## Commands

```bash
flutter pub get                           # install / resolve dependencies
flutter analyze                           # lint (must pass before release)
flutter test                              # run all tests
flutter run                               # run on default connected device
flutter run -d <device_id>               # run on specific device
flutter gen-l10n                          # regenerate localization files from ARB
flutter pub run build_runner build        # regenerate Hive *.g.dart adapters
flutter pub run build_runner watch        # watch mode for Hive adapter generation
```

**Required order before release:** `flutter pub get` → `flutter analyze` → `flutter test` → `flutter run` (manual smoke test).

---

## Code Generation — Run This After Cloning

`*.g.dart` files (Hive type adapters) are **gitignored** and not committed. After cloning or modifying any `@HiveType` model, run:

```bash
flutter pub run build_runner build
```

Without this, the project will not compile (`part '*.g.dart';` directives will fail). Affected models: `report.dart`, `house_inputs.dart`, `risk_output.dart`, `lifecycle_flag.dart`, `cost_band.dart`, `app_settings.dart`.

Localizations (`lib/l10n/app_localizations*.dart`) are also generated — but `flutter run`/`flutter build` regenerates them automatically if `generate: true` is in `pubspec.yaml` (it is). To regenerate manually: `flutter gen-l10n`.

---

## Running a Single Test

```bash
flutter test test/unit/risk_engine_test.dart
flutter test test/unit/validation_test.dart
flutter test test/integration/report_flow_test.dart
flutter test --name "RiskEngine"          # filter by test/group name
```

---

## Architecture

```
lib/
├── main.dart                 # Entry point: Hive init, adapter registration, runApp
├── app.dart                  # Root widget: locale/settings load, MaterialApp
├── l10n/                     # ARB source files + generated localizations (do not edit generated)
│   ├── app_en.arb            # English strings — source of truth for keys
│   └── app_sv.arb            # Swedish strings
├── core/
│   ├── models/               # @HiveType data models (all have *.g.dart adapters)
│   ├── services/
│   │   ├── risk_engine.dart      # Pure static compute; no Hive dependency
│   │   ├── storage_service.dart  # Hive CRUD (box: 'reports')
│   │   ├── settings_service.dart # Hive boxes: 'app_settings', 'dev_settings'
│   │   └── purchase_service.dart # Free = 1 report; paid = unlimited (IAP stub)
│   ├── data/
│   │   ├── lifespans.dart    # Derived lookup tables (not copied from standards)
│   │   └── costs.dart        # Derived cost ranges in SEK
│   └── validation.dart       # HouseInputsValidator
├── features/
│   ├── reports/              # report_list_screen, report_form_screen, report_result_screen
│   └── settings/             # settings_screen (language picker, dev unlock)
└── shared/widgets/
test/
├── widget_test.dart
├── unit/                     # risk_engine_test.dart, validation_test.dart — no Hive needed
└── integration/              # report_flow_test.dart — requires Hive setup (see below)
```

---

## Hive Boxes

| Box | Name | Key |
|-----|------|-----|
| Reports | `'reports'` | `Box<Report>` |
| App Settings | `'app_settings'` | `Box<AppSettings>` |
| Dev Settings | `'dev_settings'` | `Box<dynamic>` |

`devUnlock` lives in `'dev_settings'` (separate box) to avoid schema migration on `app_settings`.

---

## Testing Quirks

Unit tests (`risk_engine_test.dart`, `validation_test.dart`) are pure Dart — no Hive setup needed.

Widget and integration tests require Hive initialization in `setUpAll`:

```dart
setUpAll(() async {
  TestWidgetsFlutterBinding.ensureInitialized();
  final tempDir = Directory.systemTemp.createTempSync('hive_test_');
  Hive.init(tempDir.path);
  Hive.registerAdapter(ReportAdapter());
  Hive.registerAdapter(HouseInputsAdapter());
  Hive.registerAdapter(RiskOutputAdapter());
  Hive.registerAdapter(LifecycleFlagAdapter());
  Hive.registerAdapter(CostBandAdapter());
  Hive.registerAdapter(AppSettingsAdapter());
});
tearDownAll(() async { await Hive.close(); });
```

**Do not proceed to the next implementation phase until `flutter test` passes AND manual run on device/simulator succeeds.** (Constitution requirement.)

---

## Key Conventions

- **Swedish field names** — model fields and enum values use Swedish building terminology (`byggnadstyp`, `byggnadsar`, `grundlaeggning`, `sjalvdrag`, `betongplatta`, etc.). Do not anglicize.
- **`modelVersion`** — defined in `risk_engine.dart` as `const String modelVersion = '1.0.0'`. Every `Report` must store it to detect stale assessments.
- **500 ms debounce** — form saves and recomputes 500 ms after the last field change when editing an existing report.
- **Navigator key workaround** — `App` uses `GlobalKey<NavigatorState>` on `MaterialApp` because `App`'s `BuildContext` is above the navigator (T040 fix).
- **No copyrighted text** — `lib/core/data/` contains only derived numbers, not verbatim text from SBR BILAGA 3, BBR, or Folkhälsomyndigheten. See `sources.md` for citation log.
- **`specs/001-house-risk-snapshot/spec.md`** is the feature source of truth. Do not add features not described there.

---

## Risk Engine Thresholds

- `age / lifespan > 0.7` → `'risk'`; `> 0.9` → `'highRisk'`
- Special rule: `byggnadsar` 1965–1985 + `grundlaeggning == 'betongplatta'` → auto-adds drainage risk flag even without `draneringAge` input.
- Every flag must expose `triggeredBy` inputs and `contributionPercent` (explainability is a hard requirement).

---

## Legal / Product Constraints

- Every release must show: *"Not a replacement for professional inspection."* and *"Not affiliated with Boverket/Folkhälsomyndigheten."*
- Never claim "BBR-compliant", "Official risk rating", or "Approved".
- Free tier: max 1 saved report. Paid tier (one-time unlock): unlimited. IAP is a stub in v1 — full implementation required before App Store production release.
- No ads, no subscriptions, no network calls.

---

## No CI

No `.github/workflows/`, no pre-commit hooks. Quality gates are manual (see command order above).
