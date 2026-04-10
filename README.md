# HusOga

Offline-only Swedish villa risk assessment app. No backend, no accounts, no network calls.

## Stack

| Layer | Choice |
|---|---|
| Framework | React Native 0.81 + Expo SDK 54 |
| Routing | Expo Router (file-based, under `app/`) |
| Language | TypeScript (strict) |
| Persistence | AsyncStorage (local only) |
| i18n | i18n-js — `sv` (default) + `en` |
| Tests | Jest + ts-jest (pure Node, no device needed) |
| Builds | EAS Build (Expo Application Services) |
| Distribution | App Store Connect (iOS) + Google Play Console (Android) |
| IAP | `expo-in-app-purchases` — one-time non-consumable unlock |
| Subscriptions | None — one-time purchase only (no subscription management needed) |

## Monetization

One-time unlock. Free tier = 2 basic reports. Paid tier = unlimited reports + detailed report + PDF export + share.

- iOS product ID: `com.husoga.pro`
- Android product ID: `com.husoga.pro` (pending Play Console setup)

See `docs/commerce/iap-setup-sweden-enskild-firma.md` for store setup steps.

## Dev

```bash
npm install
npm test
npm start          # Expo Go (scan QR)
npm run ios        # iOS Simulator
npm run android    # Android Emulator
```

## Deployment

Builds and store submission are handled by EAS. See `docs/deployment.md` for full build + release steps.

```bash
eas build --platform ios --profile production
eas build --platform android --profile production
eas submit --platform ios
eas submit --platform android
```

## Workflow (GitHub Issues)

- Create or pick an issue before making changes.
- Every commit subject must include `refs #<issue>`.
- Prefer roadmap priority order unless explicitly overridden.
- When closing an issue or completing a milestone, update `## Project Status` below in the same commit.

See `docs/roadmap.md` for the full task list.

## Architecture

```
app/          Expo Router screens (form, result, settings, report list)
src/core/     Risk engine, models, AsyncStorage services, IAP, i18n
__tests__/    Jest unit tests (risk engine + validation)
docs/         Deployment, commerce, product specs, risk logic research
plugins/      EAS config plugins (Android BILLING permission)
```

Flutter v1 source is preserved on the `flutter-archive` branch.

## Project Status

**Completed:** Risk engine v2, Basic/Detailed report UX, in-app sources, IAP wiring, and the full **Condition Engine v3** rewrite are all shipped. The single aggregate score has been replaced with a per-component traffic-light konditionsöversikt (6 rows: Tak, Fasad, Grund, Våtrum, Ventilation, Uppvärmning). Result screen, Detailed screen, PDF export, and share text all reflect the new structure. MODEL_VERSION is 2.0.0.

**Free/paid split:**
- Free: traffic-light konditionsöversikt (6 rows) + viewing tips
- Paid: decision points, cost forecast, lifetime analysis, green recommendations, PDF export

**Epic 9 — App Store publishing (in progress):**
- ✅ #69 Android adaptive icon — transparent-background foreground layer generated
- ✅ #70 App Store + Play Store listing copy — `docs/marketing/app-store-copy.md`
- ✅ #71 Screenshot specs + content plan — `docs/marketing/screenshot-specs.md`
- ✅ #72 Website `index.html` with privacy policy (ready for Cloudflare Pages deploy)
- 🔄 #73 iOS EAS build + TestFlight submission — in progress
- 🔄 #74 Android EAS build + Play Console submission — in progress

_Last updated: 2026-04-10 (refs #69, #70, #71, #72, #73, #74)_
