# Roadmap

This repo uses GitHub Issues to track all meaningful work.

Meta tracking issue: #2

This roadmap is a checklist. Items are checked when the linked GitHub issue is closed.

## Priority Order

1. Risk Engine v2 (logic)
2. Report UX (basic vs detailed, paywall)
3. Sources & references (in-app)
4. Plans + IAP (free vs paid rules)
5. Website (single HTML page)

## Epics

### 1) Risk Engine v2

Epic: #16

Tasks:
- [x] #21 Spec: Risk Engine v2 formulas + component weights
- [x] #22 Implement: continuous deterioration curve f(age/lifespan)
- [x] #23 Implement: explicit component weights (BCI aggregation)
- [x] #24 Implement: defect multipliers for Swedish risk patterns
- [x] #25 Bump MODEL_VERSION and add stale report detection + recalc (ties to #13)
- [x] #26 Tests: expand riskEngine coverage for v2

### 2) Report UX

Epic: #17

Tasks:
- [x] #27 Spec: Basic vs Detailed report content (free vs paid)
- [x] #28 UI: add CTA to view Detailed report and paywall for free users
- [x] #29 UI: build Detailed report screen (paid)
- [x] #42 fix(ui): clarify cost highlight in dark mode
- [x] #30 Paid: export/share report (text share)
- [x] #31 Paid: generate PDF from report

### 3) Sources & References

Epic: #18

Tasks:
- [x] #32 Data: create curated sources registry
- [x] #33 UI: show Sources section in Basic report
- [x] #34 UI: show Sources in Detailed report grouped by topic

### 4) Plans + IAP

Epic: #19

Tasks:
- [ ] #35 Plan: free tier should allow 2 basic reports
- [ ] #36 IAP: implement real purchase + restore (ties to #11)
- [ ] #37 Gating: enforce paid-only features

### 5) Website

Epic: #20

Tasks:
- [ ] #38 Website: create single index.html (inline CSS) with placeholders
- [ ] #39 Website: populate copy and add legal disclaimers

## Existing Open Issues

- #11 Real IAP + restore (will be covered by #36)
- #12 Paid tier value definition (will be covered by #27/#29)
- #13 Stale report detection (covered by #25)
- #14 Localize triggeredBy labels (likely part of Detailed report UX)
