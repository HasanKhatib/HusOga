# HusÖga — Project History

A record of what was built, why key decisions were made, and the build timeline.
Useful for onboarding, post-mortems, and revisiting decisions.

---

## What Was Built

HusÖga is an offline-only Swedish villa condition assessment tool for house buyers.
It started as a Flutter app and was migrated to React Native / Expo.

The user fills in house details during a visning (open house viewing). The app compares
component ages against technical lifespan and outputs a per-component traffic-light
konditionsöversikt for six components: roof, drainage, wet rooms, plumbing/water,
heating, and ventilation.

**Free tier:** traffic-light summary (6 rows) + viewing tips + up to 2 saved reports.  
**Pro (one-time purchase):** decision points, cost forecast, lifetime analysis, green
recommendations, PDF export, unlimited reports.

---

## Key Decisions

### Swedish field names are intentional and permanent

Model fields and enum values use Swedish building terminology (`byggnadstyp`,
`byggnadsar`, `grundlaeggning`, `yttertakType`, `sjalvdrag`, `betongplatta`, etc.).
These are stored in AsyncStorage on every user's device. Anglicising them would be a
breaking schema change — all existing user reports would become unreadable.

**Do not rename these fields without a migration plan.**

### "Condition" framing, not "risk"

The app was deliberately reframed from "risk" to "condition" terminology in the v3
rewrite. Reasons:

1. "Risk" framing is legally fraught in the Swedish housing context — it implies a
   qualified assessment that the app cannot legally provide.
2. "Kondition" / "underhållsbehov" framing is consistent with how Swedish housing
   professionals (SBR, Anticimex) describe building assessments.
3. It makes the product viable for partnership with platforms like Hemnet or Booli
   that would never associate with a "risk rating" tool.

User-facing strings: `levelOk = Välskött`, `levelAttention = Kräver uppmärksamhet`,
`levelPriority = Kräver åtgärd`. Never revert to "risk", "score", or "rating" language.

### No aggregate score

The v3 condition engine dropped the single aggregate score entirely. Reasons:

1. A single number implies precision the model does not have.
2. It invited gaming (users trying to get a "good score" rather than understanding
   component condition).
3. Professional besiktningsmän do not produce aggregate scores — they assess
   per-component.

`MODEL_VERSION = '2.0.0'` reflects this breaking change. Old reports with `score` /
`scoreBand` fields are detected and recalculated on load.

### No backend, no accounts

All data lives in AsyncStorage on the device. No server, no sync, no accounts.
This was a deliberate MVP constraint: simplifies GDPR compliance, removes infrastructure
cost, and makes the app fully functional offline (critical for visningar in areas with
poor signal).

The downside is no cross-device sync and no recovery if a user loses their phone.
A future migration to iCloud / Google Drive sync is possible without a backend.

### RevenueCat over expo-in-app-purchases

`expo-in-app-purchases` was removed from the Expo monorepo and its Android
`build.gradle` hardcoded `compileSdkVersion 33` against Expo SDK 54's requirement of
`compileSdkVersion 36`. This caused `EAS_BUILD_UNKNOWN_GRADLE_ERROR` on every Android
build (4 consecutive failures before root cause was identified).

Replaced with `react-native-purchases` (RevenueCat SDK). RevenueCat inherits
`compileSdkVersion` from the root project and is actively maintained.

**RevenueCat entitlement ID:** `pro`  
**Product ID (both stores):** `com.husoga.pro`  
**API keys:** stored as EAS sensitive env vars (`REVENUECAT_IOS_API_KEY`,
`REVENUECAT_ANDROID_API_KEY`) — never in git.

### New Architecture disabled

`newArchEnabled: false` in `app.json`. `react-native-purchases@9.15.2` does not support
React Native's New Architecture (Fabric / JSI). Re-enable when RevenueCat adds support.

### Two tsconfig files

`tsconfig.json` uses `moduleResolution: bundler` (Metro-compatible).
`tsconfig.test.json` uses `moduleResolution: node` (CommonJS, required by Jest/ts-jest).
Without `tsconfig.test.json`, Jest cannot resolve imports. Do not remove it.

### Special drainage rule

`src/core/services/riskEngine.ts`: houses built 1965–1985 with `grundlaeggning ===
'betongplatta'` automatically get a drainage flag added — but only if no drainage flag
already exists from the `draneringAge` input. This reflects the known risk of aging
drainage systems under slab foundations from this era.

---

## Epic Timeline

| # | Epic | Shipped | Key outcome |
|---|---|---|---|
| 1 | Risk Engine v2 | Feb 2026 | Continuous deterioration curve f(age/lifespan), component weights, defect multipliers |
| 2 | Report UX | Feb 2026 | Basic vs Detailed split, paywall CTA, PDF export, text share |
| 3 | Sources & References | Mar 2026 | In-app curated sources registry, shown in both Basic and Detailed reports |
| 4 | Plans + IAP | Mar 2026 | Free tier (2 reports), IAP wiring, paid feature gating |
| 5 | Condition Engine v3 | Apr 2026 | Traffic-light output, dropped aggregate score, MODEL_VERSION 2.0.0 |
| 6 | Result Screen Rewrite | Apr 2026 | ComponentRow UI, viewing tips, decision points, cost forecast, lifetime analysis, green recommendations |
| 7 | PDF / Share Rewrite | Apr 2026 | Traffic-light HTML PDF template, updated share text |
| 8 | Website | Apr 2026 | Single `index.html` with privacy policy, ready for Cloudflare Pages |
| 9 | App Store Publishing | Apr 2026 | Adaptive icon, store copy, screenshot specs, iOS build (6) in TestFlight, Android AAB in Internal Testing |
| 10 | RevenueCat IAP Migration | Apr 2026 | Replaced `expo-in-app-purchases` with `react-native-purchases`, Android builds unblocked |

---

## Build & Submit Timeline

| Date | Event |
|---|---|
| 2026-04-12 | Android build `6724b568` — first successful Android EAS build after RevenueCat migration |
| 2026-04-12 | Android AAB manually uploaded to Play Console Internal Testing (required for new apps) |
| 2026-04-12 | iOS build `fe777117` (build 5) — finished, IPA ready |
| 2026-04-12 | iOS submit attempts with build 5 — failed: 401 (missing ASC API key config), then "build number already used" |
| 2026-04-12 | iOS build `930d9157` (build 6) — triggered after fixing `eas.json` ASC key config + auto-increment |
| 2026-04-12 | iOS submit with build 6 — **succeeded**, IPA uploaded to App Store Connect |
| 2026-04-12 | Apple processing email received — build 6 (1.0.0) available in TestFlight |

---

## Flutter Archive

The original Flutter implementation is preserved on the `flutter-archive` branch.
It is not maintained and is kept for reference only.
