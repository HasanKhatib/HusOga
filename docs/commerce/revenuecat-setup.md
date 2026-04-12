# RevenueCat Setup Guide

HusÖga uses [RevenueCat](https://www.revenuecat.com) to manage in-app purchases across iOS and Android.

RevenueCat wraps StoreKit (iOS) and Google Play Billing (Android) and provides a unified entitlements API. The free tier covers everything HusÖga needs.

---

## One-time Setup (human task — see issue #79)

### 1. Create a RevenueCat account
Go to https://app.revenuecat.com/signup — free, no credit card.

### 2. Create a Project
Dashboard → **+ New Project** → Name: **HusÖga**

### 3. Add the iOS app
- **+ Add app** → App Store
- Bundle ID: `com.husoga.app`
- Copy the **iOS API key** (`appl_...`)

### 4. Add the Android app
- **+ Add app** → Google Play
- Package name: `com.husoga.app`
- Copy the **Android API key** (`goog_...`)

### 5. Create the Entitlement
**Entitlements** → **+ New Entitlement**
- Identifier: `pro`
- Display name: HusÖga Pro

### 6. Create Products
**Products** → **+ New Product** for each store:
- Product identifier: `com.husoga.pro`
- Attach to the `pro` entitlement

### 7. Store API keys in EAS (NEVER in git)

```bash
eas env:create --scope project --name REVENUECAT_IOS_API_KEY \
  --value appl_YOUR_KEY_HERE --visibility sensitive

eas env:create --scope project --name REVENUECAT_ANDROID_API_KEY \
  --value goog_YOUR_KEY_HERE --visibility sensitive
```

EAS encrypts these values. They are injected at build time and never appear in logs or source code.

### 8. Verify in code
`src/core/services/iapConfig.ts` reads the keys via `process.env`. No code changes needed after this step.

---

## Entitlement identifier

| Key | Value |
|-----|-------|
| Entitlement ID | `pro` |
| Product ID (iOS + Android) | `com.husoga.pro` |

---

## How it works at runtime

1. `app/_layout.tsx` calls `Purchases.configure({ apiKey })` on startup.
2. `iap.ts → getOfferings()` fetches the available package.
3. `iap.ts → purchasePackage()` triggers the native purchase sheet.
4. `iap.ts → restorePurchases()` checks `entitlements.active['pro']`.
5. On success, `purchase.ts → unlockPurchased()` writes `purchased: true` to AsyncStorage.

---

## Links

- RevenueCat dashboard: https://app.revenuecat.com
- SDK docs: https://www.revenuecat.com/docs/getting-started/installation/reactnative
- Entitlements guide: https://www.revenuecat.com/docs/entitlements
