# Roadmap

Work is tracked in GitHub Issues. This document is the forward-looking view.
For the full development history and key decisions, see `docs/history.md`.

---

## What's Built

HusÖga is a complete, offline-only Swedish villa condition assessment tool for house
buyers. The core product is feature-complete and submitted to both stores.

**Core features:**
- Per-component traffic-light konditionsöversikt (6 components: roof, drainage, wet rooms, plumbing, heating, ventilation)
- Condition engine based on Swedish technical lifespan data and construction-era risk factors
- Viewing tips tailored to results (free)
- Decision points, cost forecast (SEK), lifetime analysis, green recommendations (Pro)
- PDF export and text share (Pro)
- Full Swedish + English i18n
- Offline-only, no accounts, no tracking

**Free / Pro split:**
- Free: traffic-light summary + viewing tips + up to 2 saved reports
- Pro: decision points, cost forecast, lifetime analysis, green recommendations, PDF export, unlimited reports

---

## Platforms

| Platform | Current state | Store link |
|---|---|---|
| iOS | Build 6 (1.0.0) in TestFlight — not yet in App Store | [App Store Connect](https://appstoreconnect.apple.com/apps/6761786637) |
| Android | AAB in Internal Testing — not yet in Production | [Play Console](https://play.google.com/console/u/0/developers/4675244536437696492) |

**EAS project:** `https://expo.dev/accounts/hasankhatib/projects/husoga`  
**Bundle ID (both):** `com.husoga.app`  
**IAP product ID (both):** `com.husoga.pro`

---

## Pre-Launch Checklist

### Track A — Store blockers (must be done before App Review approval)

These block Apple/Google from approving the app. Do them first.

- [ ] **#81** Deploy website to Cloudflare Pages (`husoga.app` must resolve for privacy policy URL)
- [ ] **#82** Create `com.husoga.pro` IAP in App Store Connect (Monetize → In-App Purchases)
- [ ] **#83** Create `com.husoga.pro` IAP in Google Play Console (Monetize → In-app products)
- [ ] **#84** Create App Store screenshots — 5 frames, iOS (1320×2868) + Android (1080×1920)

### Track B — Publishing (after Track A is complete)

- [ ] **#85** TestFlight internal test + submit for App Store Review
- [ ] **#86** Promote Android from Internal Testing to Production in Play Console

---

## Rollout Plan

1. Complete Track A (all four store blockers)
2. Self-test on TestFlight (build 6 is live now)
3. Submit for App Store Review (#85)
4. Promote Android to Production (#86) — can happen in parallel with iOS review
5. Public launch

---

## Completed Epics

Full details in `docs/history.md`.

| Epic | Summary |
|---|---|
| 1 — Risk Engine v2 | Deterioration curves, component weights, defect multipliers |
| 2 — Report UX | Basic vs Detailed split, paywall, PDF export, text share |
| 3 — Sources & References | In-app curated sources, shown in both report views |
| 4 — Plans + IAP | Free tier (2 reports), IAP wiring, paid feature gating |
| 5 — Condition Engine v3 | Traffic-light output, dropped aggregate score, MODEL_VERSION 2.0.0 |
| 6 — Result Screen Rewrite | ComponentRow UI, viewing tips, cost forecast, lifetime analysis |
| 7 — PDF / Share Rewrite | Traffic-light HTML template, updated share text |
| 8 — Website | `index.html` with privacy policy, ready for Cloudflare Pages |
| 9 — App Store Publishing | Adaptive icon, store copy, iOS build in TestFlight, Android in Internal Testing |
| 10 — RevenueCat IAP Migration | Replaced `expo-in-app-purchases` with `react-native-purchases`, Android builds unblocked |
