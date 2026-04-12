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
| IAP | `react-native-purchases` (RevenueCat) — one-time non-consumable unlock |
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

**Feature-complete. Both stores loaded. Pre-launch checklist in progress.**

| Platform | Status |
|---|---|
| iOS | Build 6 (1.0.0) processed by Apple — available in TestFlight |
| Android | AAB in Play Console Internal Testing |

**Pre-launch checklist** (see `docs/roadmap.md` for detail):
- [ ] #81 Deploy website to Cloudflare Pages (`husoga.app`)
- [ ] #82 Create `com.husoga.pro` IAP in App Store Connect
- [ ] #83 Create `com.husoga.pro` IAP in Google Play Console
- [ ] #84 Create App Store screenshots (5 frames)
- [ ] #85 TestFlight test + submit for App Store Review
- [ ] #86 Promote Android to Production

_Last updated: 2026-04-12 (refs #81–#86)_
