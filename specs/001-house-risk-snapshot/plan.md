# Implementation Plan: House Risk Snapshot

**Branch**: `001-house-risk-snapshot` | **Date**: 2026-02-23 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/001-house-risk-snapshot/spec.md`. Product context: `specs.md` at repo root.

## Summary

Mobile Flutter app for Swedish pre-purchase villa buyers. Users enter house data, receive risk score, lifecycle flags, 5–10 year cost estimates, and negotiation checklist. Reports stored locally (no accounts/cloud). Free: 1 report; one-time paid unlock = unlimited reports. Paid value = detailed breakdown + negotiation pack. English and Swedish support. Risk engine uses derived norms from SBR BILAGA 3 (see `sources.md`); no embedded copyrighted text.

## Technical Context

**Language/Version**: Dart 3.x (Flutter SDK 3.x)
**Primary Dependencies**: Flutter, flutter_localizations
**Storage**: Hive (local NoSQL; recommended over shared_preferences for report objects)
**Testing**: flutter test (unit); integration tests for risk engine
**Target Platform**: iOS 15+, Android 8+
**Project Type**: mobile-app
**Performance Goals**: Risk recompute within 1 second of last edit
**Constraints**: Offline-only, no network; <100MB app size target
**Scale/Scope**: Free 1 report; paid = unlimited; typical 5–10 screens

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status |
|------|--------|
| Mobile-only, Flutter | ✓ |
| No backend, no accounts, no cloud sync | ✓ |
| Local storage per constitution (hive or shared_preferences) | ✓ (Hive chosen in research) |
| specs.md / spec.md drive implementation | ✓ |
| model_version in every report | ✓ (in data model) |
| Explainability: triggers + contributions per flag | ✓ (in spec) |
| Swedish + English support (spec clarification) | ✓ |
| No BBR compliance claims; legal copy | ✓ |
| v1 non-goals respected (no OVK lookup, no PDF export); IAP required for App Store | ✓ |

**Result**: All gates pass. No violations.

## Project Structure

### Documentation (this feature)

```text
specs/001-house-risk-snapshot/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── sources.md           # Citation log: SBR BILAGA 3, BBR, Folkhälsomyndigheten
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (screen flows)
├── checklists/
│   └── requirements.md
└── tasks.md             # Phase 2 output (/speckit.tasks — not created by plan)
```

### Source Code (repository root)

```text
lib/
├── main.dart
├── app.dart
├── l10n/                    # Localizations (ARB files for en, sv)
├── core/                    # Shared models, services
│   ├── models/              # Report, HouseInputs, RiskOutput
│   ├── services/
│   │   ├── risk_engine.dart # Compute score, flags, cost band
│   │   ├── storage_service.dart
│   │   └── purchase_service.dart # IAP / paid unlock
│   └── data/                # Derived lookup tables (from sources.md); no copyrighted text
├── features/
│   ├── reports/             # Report list, form, result
│   │   ├── report_list_screen.dart
│   │   ├── report_form_screen.dart
│   │   ├── report_result_screen.dart
│   │   └── widgets/
│   └── settings/
│       ├── settings_screen.dart
│       └── widgets/
└── shared/                  # Shared widgets (input_form, risk_display)

test/
├── unit/
│   ├── risk_engine_test.dart
│   └── validation_test.dart
└── integration/
    └── report_flow_test.dart
```

**Structure Decision**: Feature folders (`features/reports`, `features/settings`) for maintainability. `core/` holds models, services, and derived data. Do not embed copyrighted text; store only derived numbers/assumptions per `sources.md`.

## Complexity Tracking

> No constitution violations. This section is empty.
