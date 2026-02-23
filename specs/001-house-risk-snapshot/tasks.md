# Tasks: House Risk Snapshot

**Input**: Design documents from `specs/001-house-risk-snapshot/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Constitution specifies "focus on risk engine logic." Unit tests for risk engine and validation included. UI tests deferred.

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story (US1–US5)
- Include exact file paths in descriptions

## Path Conventions

- **Flutter**: `lib/` at repo root; `lib/core/`, `lib/features/`, `lib/shared/`
- **Tests**: `test/unit/`, `test/integration/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create Flutter project with `flutter create` and folder structure per plan: `lib/core/`, `lib/core/models/`, `lib/core/services/`, `lib/core/data/`, `lib/features/reports/`, `lib/features/reports/widgets/`, `lib/features/settings/`, `lib/features/settings/widgets/`, `lib/shared/`, `lib/l10n/`, `test/unit/`, `test/integration/`
- [X] T002 Add pubspec dependencies: hive, hive_flutter, uuid, flutter_localizations; dev_dependencies: hive_generator, build_runner; run `flutter pub get` (hive_generator required for Report adapter codegen)
- [X] T003 [P] Configure `analysis_options.yaml` and enable `flutter gen-l10n` in `pubspec.yaml` l10n section

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure required before any user story. No user story work until this phase is complete.

- [X] T004 [P] Create Report, HouseInputs, RiskOutput, LifecycleFlag, CostBand models in `lib/core/models/` per data-model.md
- [X] T005 [P] Create AppSettings model in `lib/core/models/` (locale, purchased)
- [X] T006 Create BILAGA 3 derived lookup tables (lifespans, costs) in `lib/core/data/` per sources.md; no copyrighted text
- [X] T007 [P] Implement input validation (FR-016: build year 1800–current, area 10–2000, ages 0–150) in `lib/core/` or `lib/shared/`
- [X] T008 Initialize Hive in `main.dart`, register adapters for Report; init `lib/core/services/storage_service.dart` stub if needed for adapter registration
- [X] T009 Implement RiskEngine: compute score, flags, cost band, checklist from HouseInputs in `lib/core/services/risk_engine.dart`
- [X] T010 [P] Add risk engine unit tests in `test/unit/risk_engine_test.dart`
- [X] T011 [P] Add validation unit tests in `test/unit/validation_test.dart`

**Checkpoint**: Foundation ready — user story implementation can begin

---

## Phase 3: User Story 1 - Complete First Risk Assessment (Priority: P1) MVP

**Goal**: User creates report, enters house data, taps Calculate, sees risk score, lifecycle flags, cost band, negotiation checklist.

**Independent Test**: Create new report, enter required inputs, verify risk score, flags, and cost band appear. No save or list view needed.

### Implementation for User Story 1

- [X] T012 [P] [US1] Create report form input widgets in `lib/shared/widgets/input_form/`: required (byggnadstyp, year, size, grundläggning, roof type/age, facade type/age, heating, ventilation) and optional (stomme, site type, gutters age, windows type/age, drainage age, wet room age, chimney, heat pump age)
- [X] T013 [P] [US1] Create risk display widgets (score, flags with explainability, cost band, checklist) in `lib/shared/widgets/risk_display/`
- [X] T014 [US1] Create ReportFormScreen with form + Calculate button in `lib/features/reports/report_form_screen.dart`
- [X] T015 [US1] Create ReportResultScreen in `lib/features/reports/report_result_screen.dart`
- [X] T016 [US1] Wire form → validate (block if invalid) → RiskEngine.compute → navigate to ReportResultScreen in `lib/features/reports/report_form_screen.dart`
- [X] T017 [US1] Add app entry point and MaterialApp with routes; launch at ReportFormScreen for new report in `lib/main.dart`, `lib/app.dart`

**Checkpoint**: User Story 1 functional — create report, enter data, see results (in-memory; no persistence)

---

## Phase 4: User Story 2 - Save and List Reports (Priority: P2)

**Goal**: Reports auto-save; user sees list of saved reports; tap to open; reports persist across app restarts.

**Independent Test**: Create report, exit app, reopen; verify report appears in list and opens with data intact.

### Implementation for User Story 2

- [X] T018 [US2] Implement StorageService (Hive CRUD: save, get, list, delete) in `lib/core/services/storage_service.dart`
- [X] T019 [US2] Create ReportListScreen with empty state and list of reports (house label or default) in `lib/features/reports/report_list_screen.dart`
- [X] T020 [US2] Add "Create report" button and navigation to ReportFormScreen(new) in `lib/features/reports/report_list_screen.dart`
- [X] T021 [US2] Implement auto-save on report compute/completion; persist Report to Hive in `lib/features/reports/report_form_screen.dart` or report flow
- [X] T022 [US2] Wire app launch to ReportListScreen; update navigation so Create → Form → Result → back to List in `lib/app.dart`

**Checkpoint**: User Stories 1 and 2 functional — create, save, list, open

---

## Phase 5: User Story 3 - Edit and Recompute Report (Priority: P3)

**Goal**: User opens saved report, edits inputs, sees updated risk within 1s; changes auto-save.

**Independent Test**: Open saved report, change roof age 15→25, verify risk output updates and report saves.

### Implementation for User Story 3

- [X] T023 [US3] Add edit mode to ReportFormScreen: load existing report by id from StorageService in `lib/features/reports/report_form_screen.dart`
- [X] T024 [US3] Implement 500ms debounce + explicit Calculate; ensure result updates within 1s in `lib/features/reports/report_form_screen.dart`
- [X] T025 [US3] Auto-save on edit; update timestamp and outputs; refresh list on back in `lib/features/reports/`

**Checkpoint**: User Stories 1–3 functional — create, save, list, open, edit, recompute

---

## Phase 6: User Story 4 - Delete Report (Priority: P4)

**Goal**: User deletes report with confirmation; report removed from storage.

**Independent Test**: Create report, save, delete from list; verify report gone.

### Implementation for User Story 4

- [X] T026 [US4] Add delete action with confirmation dialog on ReportListScreen in `lib/features/reports/report_list_screen.dart`
- [X] T027 [US4] Call StorageService.delete and refresh list (or show empty state) in `lib/features/reports/report_list_screen.dart`

**Checkpoint**: User Stories 1–4 functional — full CRUD

---

## Phase 7: User Story 5 - Use App in Preferred Language (Priority: P5)

**Goal**: User selects English or Swedish; all UI and outputs in that language; choice persists across restarts.

**Independent Test**: Change language in settings, verify UI switches; restart app, verify language retained.

### Implementation for User Story 5

- [X] T028 [P] [US5] Create `app_en.arb` and `app_sv.arb` in `lib/l10n/` with strings for form labels, result labels, checklist, errors
- [X] T029 [US5] Configure MaterialApp with localization delegates and supported locales in `lib/app.dart`
- [X] T030 [US5] Create SettingsScreen with language picker (English/Swedish) in `lib/features/settings/settings_screen.dart`
- [X] T031 [US5] Persist locale in AppSettings (Hive/SharedPreferences); apply on startup; device locale if en/sv else fallback Swedish
- [X] T032 [US5] Replace hardcoded strings with `AppLocalizations` in `lib/features/reports/`, `lib/shared/`, `lib/features/settings/`

**Checkpoint**: Full flow in English and Swedish

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Report limits, legal copy, validation

- [X] T033 Implement PurchaseService (free 1 report, paid unlimited) in `lib/core/services/purchase_service.dart`
- [X] T034 Add report limit check before Create; show "Delete to add another" or "Upgrade" when free user at limit in `lib/features/reports/report_list_screen.dart`
- [X] T035 Add legal copy in result/about: "Not a replacement for professional inspection"; "Not affiliated with Boverket/Folkhälsomyndigheten" per spec
- [X] T036 [P] Add report flow integration test (create→save→list→open) in `test/integration/report_flow_test.dart`
- [X] T037 Run quickstart.md validation; verify `flutter run` and `flutter test` pass

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 — blocks all user stories
- **Phases 3–7 (User Stories)**: All depend on Phase 2; can proceed sequentially (P1→P2→P3→P4→P5) or in parallel if staffed
- **Phase 8 (Polish)**: Depends on Phases 3–7

### User Story Dependencies

- **US1**: After Phase 2 — no other story dependency
- **US2**: After Phase 2 — depends on US1 (form, result, navigation)
- **US3**: After US2 — edit builds on form + storage
- **US4**: After US2 — delete on list + storage
- **US5**: After Phase 2 — can start with US2; integrates with all screens

### Parallel Opportunities

- Phase 1: T003 [P]
- Phase 2: T004, T005, T007, T010, T011 [P]
- Phase 3: T012, T013 [P]
- Phase 7: T028 [P]
- Phase 8: T036 [P]
- Phase 3: T012, T013 [P]
- Phase 7: T028 [P]

---

## Parallel Example: Phase 2

```bash
# Models in parallel:
Task: "Create Report, HouseInputs, RiskOutput, LifecycleFlag, CostBand in lib/core/models/"
Task: "Create AppSettings in lib/core/models/"

# Tests in parallel:
Task: "Add risk engine tests in test/unit/risk_engine_test.dart"
Task: "Add validation tests in test/unit/validation_test.dart"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1: Setup
2. Phase 2: Foundational
3. Phase 3: User Story 1
4. **STOP and VALIDATE**: Create report, enter inputs, see results
5. Demo MVP

### Incremental Delivery

1. Setup + Foundational → foundation ready
2. +US1 → first risk assessment (MVP)
3. +US2 → save and list
4. +US3 → edit and recompute
5. +US4 → delete
6. +US5 → English/Swedish
7. +Polish → report limits, legal copy

---

## Summary

| Metric | Value |
|--------|-------|
| Total tasks | 37 |
| Phase 1 (Setup) | 3 |
| Phase 2 (Foundational) | 8 |
| US1 (P1) | 6 |
| US2 (P2) | 5 |
| US3 (P3) | 3 |
| US4 (P4) | 2 |
| US5 (P5) | 5 |
| Polish | 5 |
| Parallel tasks | 10 |

**Suggested MVP scope**: Phases 1–3 (Setup + Foundational + US1)
