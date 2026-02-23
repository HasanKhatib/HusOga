# Quickstart: House Risk Snapshot

**Branch**: `001-house-risk-snapshot` | **Date**: 2026-02-23

## Prerequisites

- Flutter SDK 3.x
- Dart 3.x
- iOS Simulator or Android Emulator (or physical device)

## Setup

```bash
# Clone and checkout feature branch
git checkout 001-house-risk-snapshot

# Create Flutter project (if not exists)
flutter create . --project-name house_risk_snapshot

# Install dependencies
flutter pub get

# Generate l10n (after adding ARB files)
flutter gen-l10n
```

## Dependencies (pubspec.yaml)

```yaml
dependencies:
  flutter:
    sdk: flutter
  flutter_localizations:
    sdk: flutter
  hive: ^2.2.3
  hive_flutter: ^1.1.0
  uuid: ^4.0.0

dev_dependencies:
  hive_generator: ^2.0.1
  build_runner: ^2.4.0
  flutter_test:
    sdk: flutter
```

## Run

```bash
# Run on default device
flutter run

# Run tests
flutter test
```

## Project Layout

- `lib/core/models/` — Report, HouseInputs, RiskOutput
- `lib/core/services/risk_engine.dart` — Risk computation (derived from SBR BILAGA 3; see sources.md)
- `lib/core/services/storage_service.dart` — Hive CRUD
- `lib/core/data/` — Derived lookup tables (no copyrighted text; see sources.md)
- `lib/features/reports/` — ReportListScreen, ReportFormScreen, ReportResultScreen
- `lib/features/settings/` — SettingsScreen

## Key Spec References

- [spec.md](../spec.md) — Functional requirements, user stories
- [data-model.md](../data-model.md) — Entity definitions, validation
- [sources.md](../sources.md) — Citation log; derived vs. copied
- [contracts/screen-flows.md](contracts/screen-flows.md) — Navigation structure
- [research.md](../research.md) — Technical decisions
