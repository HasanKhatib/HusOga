# IAP Setup Guide (Sweden, Enskild Firma)

Related: #46

This is a practical checklist to get you from "no App Store / Play Console" to having **real product IDs** for a **non-consumable** paid unlock.

## What You Are Building

- Product type: **Non-consumable** (one-time unlock)
- Entitlement: `purchased = true` in-app
- Free plan: basic report only + 2 saved reports
- Paid plan: detailed report + share/PDF + unlimited reports

You cannot finalize product IDs until:
- The app exists in App Store Connect / Play Console
- Agreements, banking and tax forms are accepted
- A first binary is uploaded (often required before IAP can be tested)

## Apple (iOS)

### 1) Join Apple Developer Program

1. Create/confirm your Apple ID.
2. Enroll in Apple Developer Program:
   - Individual enrollment is fine for an Enskild Firma.
   - You will pay the annual Apple Developer fee.

What you typically need:
- Legal name + address
- Phone number
- A payment method for the annual fee

### 2) Create the App in App Store Connect

1. Go to App Store Connect → My Apps → +
- App Name: HusÖga
2. Create a new app
3. Choose:
   - Platform: iOS
   - Bundle ID: must match `app.json` (currently `com.husoga.app`)
   - SKU: internal identifier (e.g. `husoga-ios-001`)

### 3) Agreements, Tax, and Banking

Go to App Store Connect → Agreements, Tax, and Banking.

As an individual in Sweden with an Enskild Firma, expect to provide:
- Banking details for payouts
- Tax forms (Apple will guide you through required forms)
- Possibly VAT information

Important:
- You cannot sell IAP until the agreements are active.

### 4) Create Non-Consumable IAP Product

1. App Store Connect → Your App → In-App Purchases
2. Create a **Non-Consumable** product

You will define:
- Product ID (string): e.g. `com.husoga.pro`
- Reference name: HusÖga Pro
- Price tier
- Localizations (sv/en recommended)
- Review screenshot (may be required)

### 5) Upload a Build (Needed for Testing)

To test IAP you typically need a build uploaded to App Store Connect.

Recommended approach with Expo:
- Use EAS Build (expo.dev) to generate an iOS build
- Upload to App Store Connect

### 6) Test Purchases

Use a **Sandbox tester** account.

Checklist:
- App installed via TestFlight (or a dev build configured for StoreKit testing)
- Purchase flow works
- Restore purchases works

## Google Play (Android)

### 1) Create Google Play Console Account

1. Sign in with a Google account
2. Pay the one-time registration fee

### 2) Create the App Listing

1. Create new app
2. Set default language
3. Set app category

### 3) Merchant / Payments Setup

To sell IAP you must set up payments/merchant profile.

### 4) Create Non-Consumable IAP Product

Google Play Console → Monetize → Products → In-app products

Create a **Managed product** (non-consumable).

You will define:
- Product ID: e.g. `husoga_unlock`
- Name/description
- Price

### 5) Upload an Internal Test Build

You typically need an APK/AAB uploaded to test IAP.

Recommended:
- Use EAS Build for Android (AAB)
- Upload to Internal testing track

### 6) License Test Accounts

Add testers and verify:
- Purchase flow
- Restore (query purchases)

## Product IDs

Both platforms use the same product ID:

- iOS: `com.husoga.pro` (configured in `src/core/services/iapConfig.ts`)
- Android: `com.husoga.pro` (set once the Play Console managed product is created)

## App-Side Implementation Notes (Non-Consumable)

What the app supports:
- Fetch products
- Start purchase
- Client-side acknowledgement (`finishTransactionAsync`)
- Persist entitlement (`purchased=true` in AsyncStorage)
- Restore purchases

Server-side receipt validation is out of scope for v1.
