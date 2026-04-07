# Report Content Spec (Basic vs Detailed)

Related: #17
Task: #27

## Plan Rules

- Free users:
  - Can save up to 2 reports.
  - See Basic report only.
  - No share/export.
  - No Detailed report.

- Paid users:
  - Unlimited reports.
  - Basic + Detailed report.
  - Share/export + PDF.

## Basic Report (Free)

Primary goal: a fast, readable snapshot in under 10 seconds.

Sections:

1) Score
- Score number (0–100)
- Band label (low/medium/high)
- Short one-liner interpretation (localized)

2) Top flags (max 3)
- Show the 3 highest `contributionPercent` flags
- Each: icon, short message, and a compact "why" line (localized)
- No raw field keys in UI

3) Cost band (5–10 years)
- Min / likely / max
- One line explanation: "Estimated exposure based on component condition"

4) Checklist (short)
- Max 4 items

5) Sources (lightweight)
- Button: "Sources"
- Opens a simple list grouped by topic

6) Disclaimer
- Always visible

CTA:
- Button: "View detailed report"
  - Paid: navigate to detailed report
  - Free: show paywall screen

## Detailed Report (Paid)

Primary goal: explainable breakdown + actionable next steps.

Sections:

1) Summary
- Same score + band
- Flag count summary
- Highlight the top 1–2 drivers

2) Component breakdown
For each component:
- Component name
- Condition level (risk/highRisk/ok)
- Condition indicator (based on v2 curve position)
- Remaining life estimate (rough, derived)
- Replacement cost range
- Recommendation text (localized)

3) Assumptions used
- Lifespans table for the components used in this report
- Notes for skipped components (e.g., facade tegel)

4) Better alternatives (optional, informational)
- If present, must be phrased as general alternatives, not prescriptions
- Example: "If replacing roof, typical options include ..."
- Must avoid claims of superiority unless defensible

5) Sources
- Group by feature:
  - Lifespans
  - Moisture/ventilation
  - Maintenance/cost
- Include external links

6) Export / Share
- Share text summary (native share sheet)
- Generate PDF (HTML-to-PDF)

## Paywall Screen

Shown when a free user taps "View detailed report" or tries to export.

Content:
- Short value list:
  - Detailed breakdown per component
  - Better alternatives + assumptions
  - Share and PDF export
  - Unlimited reports
- Upgrade button
- Restore purchases

## Copy / Localization

- All new UI strings go through i18n.
- Avoid raw field keys (e.g. `yttertakAge`) anywhere user-visible.
- Avoid overclaiming language; keep the existing disclaimer.
