# Screen Flow Contract: House Risk Snapshot

**Branch**: `001-house-risk-snapshot` | **Date**: 2026-02-23

Defines the app's navigation structure and screen responsibilities. Used for implementation and UI testing.

## Screens

| Screen | Route | Purpose |
|--------|-------|---------|
| ReportListScreen | `/` or `/reports` | List saved reports; create new; delete |
| ReportFormScreen | `/report/:id` or `/report/new` | Enter/edit house inputs; trigger compute |
| ReportResultScreen | `/report/:id/result` | Display score, flags, cost band, checklist |
| SettingsScreen | `/settings` | Language selection; (v1) manual purchase toggle |

---

## Flow: Create First Report

1. App launch → ReportListScreen (empty state)
2. User taps "Create report" → ReportFormScreen (new)
3. User fills required inputs, taps "Calculate" → Validate; if valid, compute risk
4. Navigate to ReportResultScreen with computed output
5. Auto-save report; back → ReportListScreen shows new report

---

## Flow: Open Saved Report

1. ReportListScreen → User taps report → ReportFormScreen (existing id)
2. Form loads saved inputs; user can edit and "Calculate" again
3. Result updates; auto-save; back → list reflects updated label/timestamp

---

## Flow: Delete Report

1. ReportListScreen → User selects delete on report
2. Show confirmation dialog
3. On confirm → Remove from storage; refresh list (or show empty state)

---

## Flow: Change Language

1. SettingsScreen → User selects English or Swedish
2. App locale updates; all screens rebuild with new strings
3. Persist choice; survive restart

---

## Report Limit Handling

- Free: 1 report. When at limit, "Create report" shows: "Delete to add another" or "Upgrade to unlock unlimited reports"
- Paid (one-time unlock): unlimited reports
- No navigation to new report form when free user at limit until delete or upgrade
