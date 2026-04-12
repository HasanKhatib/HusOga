# Roadmap

This repo uses GitHub Issues to track all meaningful work.

Meta tracking issue: #2

This roadmap is a checklist. Items are checked when the linked GitHub issue is closed.

## Priority Order

1. ~~Risk Engine v2 (logic)~~ ✅
2. ~~Report UX (basic vs detailed, paywall)~~ ✅
3. ~~Sources & references (in-app)~~ ✅
4. ~~Plans + IAP (free vs paid rules)~~ ✅
5. ~~Condition Engine v3 (traffic-light output, no aggregate score)~~ ✅
6. ~~Result screen rewrite (traffic-light layout, progressive disclosure)~~ ✅
7. ~~PDF/share rewrite (buyer-quality output)~~ ✅
8. ~~Website (single HTML page)~~ ✅
9. ~~App Store publishing (iOS + Android)~~ ✅
10. ~~RevenueCat IAP migration~~ ✅

## Epics

### 1) Risk Engine v2 ✅

Epic: #16

Tasks:
- [x] #21 Spec: Risk Engine v2 formulas + component weights
- [x] #22 Implement: continuous deterioration curve f(age/lifespan)
- [x] #23 Implement: explicit component weights (BCI aggregation)
- [x] #24 Implement: defect multipliers for Swedish risk patterns
- [x] #25 Bump MODEL_VERSION and add stale report detection + recalc (ties to #13)
- [x] #26 Tests: expand riskEngine coverage for v2

### 2) Report UX ✅

Epic: #17

Tasks:
- [x] #27 Spec: Basic vs Detailed report content (free vs paid)
- [x] #28 UI: add CTA to view Detailed report and paywall for free users
- [x] #29 UI: build Detailed report screen (paid)
- [x] #42 fix(ui): clarify cost highlight in dark mode
- [x] #30 Paid: export/share report (text share)
- [x] #31 Paid: generate PDF from report

### 3) Sources & References ✅

Epic: #18

Tasks:
- [x] #32 Data: create curated sources registry
- [x] #33 UI: show Sources section in Basic report
- [x] #34 UI: show Sources in Detailed report grouped by topic

### 4) Plans + IAP ✅

Epic: #19

Tasks:
- [x] #35 Plan: free tier should allow 2 basic reports
- [x] #36 IAP: implement real purchase + restore (ties to #11)
- [x] #37 Gating: enforce paid-only features

### 5) Condition Engine v3 ✅

Epic: #51

Replaces the single aggregate score with a per-component traffic-light output.
All 6 components always emitted. Drops `score`, `scoreBand`, `lifecycleFlags`.
MODEL_VERSION bumps to 2.0.0.

Free/paid split:
- Free: traffic-light summary (6 rows) + viewing tips
- Paid: decision points, cost forecast, lifetime analysis, green recommendations

Tasks:
- [x] #55 6a: New types — ConditionLevel, ComponentCondition, ConditionOutput
- [x] #56 6b: Rewrite engine output, viewingTips + greenSignals builders, MODEL_VERSION 2.0.0
- [x] #57 6c: i18n — condition framing strings, viewing tips, green signals (both locales)
- [x] #58 6d: Localize triggeredBy field name labels (fix #14)
- [x] #59 6e: Rewrite riskEngine tests for new ConditionOutput shape

### 6) Result Screen Rewrite ✅

Epic: #52

Tasks:
- [x] #60 7a: ComponentRow UI — traffic-light summary card (replaces score card)
- [x] #61 7b: Viewing tips section (free)
- [x] #62 7c: Decision points section (paid, gated)
- [x] #63 7d: Cost forecast section (paid, replaces CostPill row)
- [x] #64 7e: Lifetime analysis section (paid, age vs lifespan table)
- [x] #65 7f: Green recommendations section (paid)
- [x] #66 7g: Report list index — replace score pill with compact traffic-light dots

### 7) PDF / Share Rewrite ✅

Epic: #53

Tasks:
- [x] #67 8a: Rewrite PDF HTML template with traffic-light structure and buyer-quality sections
- [x] #68 8b+8c: Update buildShareText to describe traffic-light summary

### 8) Website

Epic: #20

Tasks:
- [x] #72 9e: Complete website — index.html with privacy policy (closes #38, #39)

### 9) App Store Publishing ✅

Epic: #54

Tasks:
- [x] #69 9a: Fix Android adaptive icon (transparent-bg foreground layer)
- [x] #70 9b+9c: Write App Store and Play Store listing copy
- [x] #71 9d: Screenshot specs and mockup guide
- [x] #73 9f: iOS build and TestFlight submission
- [x] #74 9g: Google Play account setup and Android submission

### 10) RevenueCat IAP Migration ✅

Epic: #75

Replaces the defunct `expo-in-app-purchases` (incompatible with Expo SDK 54, removed from
Expo monorepo) with `react-native-purchases` (RevenueCat). Root cause of all 4 Android
EAS build failures (`EAS_BUILD_UNKNOWN_GRADLE_ERROR`).

Tasks:
- [x] #76 Remove expo-in-app-purchases, install react-native-purchases@9.15.2
- [x] #77 Rewrite iap.ts + iapConfig.ts for RevenueCat SDK
- [x] #78 Initialise RevenueCat in app/_layout.tsx
- [x] #79 **[HUMAN]** Create RevenueCat project + set API keys as EAS env vars
- [x] #80 Update deployment.md + README for RevenueCat

## Rollout

1. Internal TestFlight (self-test)
2. Friends & family TestFlight (5–10 testers)
3. Public App Store release
4. Google Play release

## Existing Open Issues

- #14 Localize triggeredBy labels → covered by #58
- #47 IAP: iOS non-consumable unlock
- #48 Google Play Developer account → covered by #74
- #49 IAP: Android managed product
