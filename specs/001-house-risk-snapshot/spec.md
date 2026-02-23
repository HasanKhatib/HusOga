# Feature Specification: House Risk Snapshot

**Feature Branch**: `001-house-risk-snapshot`  
**Created**: 2026-02-23  
**Status**: Draft  
**Input**: User description from product spec at repo root. Mobile house risk assessment app per Swedish SBR/BILAGA 3 norms: local storage, risk engine, lifecycle flags, 5-10 year cost estimates, negotiation checklist. Flutter. v1 scope.

**Source of truth:** This file (`spec.md`). Product context: `specs.md` at repo root.

## Clarifications

### Session 2026-02-23

- Q: Default language on first launch? → A: Device locale; if device is English or Swedish use it, otherwise fall back to Swedish.
- Q: Invalid required input handling? → A: Block submit; show inline validation errors; user must correct before proceeding.
- Q: Maximum number of saved reports? → A: Free users 1 report; one-time paid unlock = unlimited reports. Paid tier value = detailed breakdown + negotiation pack, not report count.
- Q: Input validation boundaries for numeric fields? → A: Enforce sensible bounds: build year 1800–current, area 10–2000 m², ages 0–150; reject out-of-range with inline error.
- Q: Risk recompute responsiveness? → A: Results update within 1 second of last edit (or on explicit Calculate tap).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Complete First Risk Assessment (Priority: P1)

A prospective home buyer opens the app, creates a new report, enters the required house data (building type, year, size, foundation, roof type/age, facade type/age, heating, ventilation), and receives an immediate risk summary: overall score, lifecycle flags (roof, facade, drainage, heating, ventilation, wet rooms), 5–10 year cost exposure band, and a basic negotiation checklist.

**Why this priority**: Core value proposition—users get actionable insights without accounts or cloud. Nothing else matters if the risk engine does not deliver.

**Independent Test**: Create a new report, enter minimum required inputs, and verify risk score, flags, and cost band appear. No save or list view needed.

**Acceptance Scenarios**:

1. **Given** no report exists, **When** user creates new report and enters all required inputs, **Then** system displays risk score (0–100 or Low/Medium/High), lifecycle flags, 5–10 year cost band, and basic negotiation checklist.
2. **Given** user has entered required inputs, **When** user submits, **Then** each flagged component shows which inputs triggered it and how much it contributed to the score (explainability).
3. **Given** user enters optional inputs (e.g. windows, drainage age, wet room age), **When** system computes risk, **Then** risk assessment reflects those inputs and adjusts flags and cost estimates accordingly.

---

### User Story 2 - Save and List Reports (Priority: P2)

A user completes or partially completes a report. The system auto-saves it to local storage. The user can view a list of all saved reports, each identified by a house label (e.g. address). Reports persist across app restarts.

**Why this priority**: Without persistence, users cannot compare houses or return to a report later. Essential for real-world buying workflows.

**Independent Test**: Create a report, exit app, reopen; verify report appears in list and can be opened with data intact.

**Acceptance Scenarios**:

1. **Given** user has entered data, **When** user navigates away or app restarts, **Then** report is saved to local storage and appears in the report list.
2. **Given** report list view, **When** user taps a report, **Then** report opens with all previously entered data.
3. **Given** saved report, **When** user has not set a house label, **Then** list shows a default identifier (e.g. timestamp or "Report 1"); user can add or edit the label later.

---

### User Story 3 - Edit and Recompute Report (Priority: P3)

A user opens a saved report and changes one or more inputs (e.g. roof age, facade type). The system recalculates the risk score, flags, and cost estimate. Updated report is saved automatically.

**Why this priority**: Buyers often receive corrected information from sellers; editing and recomputing is expected.

**Independent Test**: Open saved report, change roof age from 15 to 25 years, verify risk output updates and report saves.

**Acceptance Scenarios**:

1. **Given** open report, **When** user edits any input, **Then** system recalculates and displays updated risk score, flags, and cost estimate.
2. **Given** edited report, **When** user navigates away, **Then** changes are saved; reopening shows the updated data and outputs.
3. **Given** open report, **When** user edits house label, **Then** label is saved and displayed in the report list.

---

### User Story 4 - Delete Report (Priority: P4)

A user removes a report they no longer need from the list. The report and its data are permanently deleted from local storage.

**Why this priority**: Data hygiene and user control; lower priority than core flow and persistence.

**Independent Test**: Create report, save, delete from list; verify report no longer appears and data is gone.

**Acceptance Scenarios**:

1. **Given** report list with at least one report, **When** user chooses to delete a report, **Then** system confirms and removes the report from storage; list no longer shows it.
2. **Given** empty report list, **When** user views list, **Then** appropriate empty state is shown (e.g. prompt to create first report).

---

### User Story 5 - Use App in Preferred Language (Priority: P5)

A user chooses English or Swedish as the display language. All interface elements, input labels, risk output, negotiation checklist, and explanatory text are shown in the selected language. The choice persists across app restarts.

**Why this priority**: Broader accessibility for non-Swedish speakers (e.g. expats, international buyers) while keeping Swedish as primary for the local market.

**Independent Test**: Change language setting, verify UI and outputs switch; restart app and verify language persists.

**Acceptance Scenarios**:

1. **Given** app supports English and Swedish, **When** user selects preferred language (e.g. in settings or onboarding), **Then** all UI, labels, risk explanations, and checklist text display in that language.
2. **Given** user has selected a language, **When** app restarts, **Then** selected language is retained.
3. **Given** user switches language, **When** viewing existing report, **Then** labels and output text update to the new language; stored report data (inputs, values) is unchanged.

---

### Edge Cases

- **Missing or invalid required inputs**: System blocks submit; shows inline validation errors (e.g. missing field, negative age, future build year, out-of-range values). User must correct before computation proceeds. Numeric bounds: build year 1800–current, area 10–2000 m², ages 0–150.
- **Missing optional inputs**: System computes risk with defaults or omits optional components; no blocking errors. User sees assessment based on available data.
- **Extreme ages or values**: System handles very old houses (e.g. pre-1960) and out-of-range values without crashing; risk logic applies thresholds consistently.
- **Model version change**: Reports include model_version. If risk logic is updated, older reports can be detected; system may prompt user to re-run assessment.
- **Single report**: List view handles one report; delete leaves empty state.
- **Report limit reached**: Free user with 1 report cannot create another until deleted or upgraded. Paid (one-time unlock) users have unlimited reports. Show clear message and guidance when at limit.
- **Rapid edits**: Sequential edits trigger recomputation; final saved state reflects last valid inputs.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to create a new report and enter house data without an account or cloud sync.
- **FR-002**: System MUST collect at minimum: building type (byggnadstyp), build year, living area (m²), foundation (grundläggning), roof type and age, facade type and age, heating type, ventilation type.
- **FR-003**: System MUST compute and display an overall risk score (0–100 or Low/Medium/High) based on component lifecycle ratios and urgency.
- **FR-004**: System MUST display lifecycle flags for roof, drainage, facade, ventilation, heating, and wet rooms when risk threshold (e.g. age/lifespan > 0.7) is exceeded.
- **FR-005**: System MUST explain each flag: which inputs triggered it and how much it contributed to the score.
- **FR-006**: System MUST display a 5–10 year cost exposure band (min / likely / max) in SEK based on components flagged in that window.
- **FR-007**: System MUST provide a basic negotiation checklist aligned with Swedish besiktning practice.
- **FR-008**: System MUST save reports to local device storage and persist them across app restarts.
- **FR-009**: System MUST store per report: house label (user-editable), inputs, outputs, timestamp, model_version.
- **FR-010**: System MUST provide a list view of all saved reports; user can tap to open, edit, or delete.
- **FR-011**: System MUST support editing house label and all inputs; changes trigger recalculation and auto-save. Updated risk results must appear within 1 second of last edit (or explicit Calculate tap).
- **FR-012**: System MUST support deletion of reports with confirmation.
- **FR-013**: System MUST not require network; all data stays on device.
- **FR-014**: System MUST use Swedish building norms (SBR BILAGA 3, BBR, Folkhälsomyndigheten) as reference for lifecycle and risk logic; output phrasing must not claim official approval or BBR compliance.
- **FR-015**: System MUST support English and Swedish; user can select preferred language and all UI, labels, output text, and negotiation checklist are displayed in that language. On first launch, use device locale if English or Swedish; otherwise default to Swedish.
- **FR-016**: System MUST block submission when required inputs are missing or invalid; display inline validation errors and require correction before risk computation proceeds. Numeric bounds: build year 1800–current year, living area 10–2000 m², component ages 0–150 years; reject out-of-range with inline error.
- **FR-017**: System MUST limit saved reports: free users 1 report; one-time paid unlock = unlimited reports. Paid tier value = detailed breakdown + negotiation pack. When free user at limit, show upgrade prompt or delete-to-add message.

### Key Entities

- **Report**: A single risk assessment. Contains house label, inputs (byggnadsdata), outputs (score, flags, cost band, checklist), timestamp, model_version. Stored per house.
- **House Inputs**: Byggnadstyp, byggnadsår, size, grundläggning, roof type/age, facade type/age, heating, ventilation, and optional: stomme, site type, gutters age, windows type/age, drainage age, wet room age, chimney, chimney seal age, heat pump age.
- **Risk Output**: Score (0–100 or Low/Medium/High), lifecycle flags with explainability, 5–10 year cost band (min/likely/max SEK), negotiation checklist.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can complete a first risk assessment (create report, enter required inputs, view results) in under 5 minutes.
- **SC-002**: Reports persist across app restarts; no data loss under normal usage.
- **SC-003**: Free users can save 1 report; one-time paid unlock gives unlimited reports. Paid value = detailed breakdown + negotiation pack. List view supports open, edit, delete.
- **SC-004**: Every flagged component has an explicit explanation (triggering inputs, contribution to score); no black-box logic visible to user.
- **SC-005**: Cost band and negotiation checklist are usable as inputs to bidding decisions; wording aligns with Swedish norms (BBR, Folkhälsomyndigheten) without claiming official status.
- **SC-006**: App functions fully offline; no network dependency for core flow.
- **SC-008**: Risk results update within 1 second of last edit (or explicit Calculate action).
- **SC-007**: Both English and Swedish languages are fully supported; users can complete the full flow in their chosen language.

## Assumptions

- Platform is mobile only; no web app.
- Supported languages: English and Swedish.
- Monetization: One-time IAP for paid unlock; unlimited reports after purchase. Paid value = detailed breakdown + negotiation pack. Note: On iOS App Store, unlocking paid features typically requires In-App Purchase; manual unlock (codes, external purchase) can cause rejection except for internal/enterprise distribution.
- v1 non-goals: OVK lookup, PDF export, property APIs (Booli/Hemnet), user accounts, cloud sync.
- Output phrasing: "Recommendations informed by Swedish building regulations guidance (BBR) and public health guidance"; "Not a replacement for professional inspection"; "Not affiliated with Boverket/Folkhälsomyndigheten."
- Risk thresholds: age/lifespan > 0.7 → flag; > 0.9 → high risk. Special rules apply for suterräng 1970s, betongplatta 70s, and wet room age combinations.
