# Deployment

Builds and store submission use **EAS** (Expo Application Services). No manual Xcode/Android Studio steps are needed for release builds.

## EAS Profiles

Defined in `eas.json`:

| Profile | Use | Distribution |
|---|---|---|
| `development` | Dev client build for local testing | Internal |
| `preview` | Internal test build (Play Internal / TestFlight) | Internal |
| `production` | Store release build, auto-increments version code | Store |

## Build Commands

```bash
# Android
eas build --platform android --profile preview      # AAB for internal testing
eas build --platform android --profile production   # AAB for Play Store release

# iOS
eas build --platform ios --profile preview          # IPA for TestFlight
eas build --platform ios --profile production       # IPA for App Store release

# Both platforms
eas build --platform all --profile production

# List recent builds
eas build:list --platform android --limit 5
eas build:list --platform ios --limit 5
```

## Submit Commands

```bash
eas submit --platform ios      # submits latest production build to App Store Connect
eas submit --platform android  # submits latest production build to Play Console
```

EAS submit reads credentials from `eas.json` and the Expo account. No manual upload needed.

## EAS Projects

| Project | Slug | Project ID | Status |
|---|---|---|---|
| Active | `husoga` | `79a10484-57fc-4141-9199-12ddefdf90cc` | Use this |
| Legacy | `house-risk-snapshot` | `9fa7fdc7-7c0b-4be1-ba25-de49a995e737` | Archive when stable |

`app.json` is linked to the active project ID.

## Store Identifiers

Do not change these without intentionally creating a new app entry in the stores.

| Platform | Identifier |
|---|---|
| iOS | `com.husoga.app` (App Store Connect) |
| Android | `com.husoga.app` (Play Console) |

## IAP — RevenueCat

HusÖga uses RevenueCat (`react-native-purchases`) for IAP on both platforms.

| Key | Value |
|---|---|
| Entitlement ID | `pro` |
| Product ID (both stores) | `com.husoga.pro` |
| iOS API key | `REVENUECAT_IOS_API_KEY` EAS env var (sensitive) |
| Android API key | `REVENUECAT_ANDROID_API_KEY` EAS env var (sensitive) |

API keys are stored as EAS project environment variables (never in git).
See `docs/commerce/revenuecat-setup.md` for the full setup guide.

## Android Release Checklist

1. Run `eas build --platform android --profile preview` to produce an AAB.
2. Download the AAB from the EAS build page.
3. Upload to Play Console → Internal testing track (draft release is fine).
4. Ensure the RevenueCat project has the Android app configured with package `com.husoga.app` — see `docs/commerce/revenuecat-setup.md`.
5. Ensure `REVENUECAT_ANDROID_API_KEY` EAS env var is set — see RevenueCat dashboard → Project Settings → API Keys.
6. Ensure the `com.husoga.pro` product is created in Play Console and attached to the `pro` entitlement in the RevenueCat dashboard.
7. For production release, run `eas build --platform android --profile production` then `eas submit --platform android`.

## iOS Release Checklist

1. Run `eas build --platform ios --profile preview` for TestFlight.
2. Run `eas build --platform ios --profile production` for App Store release.
3. Submit via `eas submit --platform ios`.
4. Ensure the non-consumable IAP product `com.husoga.pro` exists in App Store Connect before releasing.

See `docs/commerce/iap-setup-sweden-enskild-firma.md` for full store account setup steps.
