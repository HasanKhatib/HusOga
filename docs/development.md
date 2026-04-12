# HusÖga — Development Guide

Architecture decisions, known gotchas, and future upgrade paths.
Read this before making changes to the core engine, schema, or IAP layer.

---

## Project Structure

```
app/                        Expo Router screens (file-based routing)
  _layout.tsx               Root layout: SettingsProvider + RevenueCat init
  index.tsx                 Report list (home screen)
  form.tsx                  House data entry + auto-save
  result.tsx                Condition overview + paid sections
  settings.tsx              Language picker + dev unlock + purchase status
src/
  core/
    models/types.ts         All TypeScript types and enums — single source of truth
    data/lifespans.ts       Component lifespans in years
    data/costs.ts           Replacement cost ranges in SEK
    services/riskEngine.ts  Pure function: computeRisk(inputs) → ConditionOutput
    services/storage.ts     AsyncStorage CRUD for reports
    services/settings.ts    AsyncStorage for AppSettings + dev unlock
    services/purchase.ts    Free/paid tier gate (calls iap.ts)
    services/iap.ts         RevenueCat getOfferings/purchasePackage/restorePurchases
    services/iapConfig.ts   RC_CONFIG — entitlementId, productId, API key env vars
    validation.ts           validateNumeric, validateAge, etc.
  context/
    SettingsContext.tsx      React context for locale + devUnlock
  i18n/
    translations.ts         i18n-js instance with en + sv translations
__tests__/
  riskEngine.test.ts        35 tests covering condition engine logic
  validation.test.ts        23 tests covering all validation functions
```

---

## Schema Rules — Read Before Changing

### Swedish field names are permanent

Model fields use Swedish building terminology:
`byggnadstyp`, `byggnadsar`, `grundlaeggning`, `yttertakType`, `sjalvdrag`,
`betongplatta`, `draneringAge`, `vattrumAge`, `vvsAge`, `uppvarmningAge`,
`ventilationAge`, etc.

These are serialised to JSON and stored in `@husoga:reports` on every user's device.
**Renaming or removing any field is a breaking change** that will corrupt existing
reports for all users. If a rename is ever necessary, write an explicit migration
in `storage.ts` that transforms old key names to new ones on first load.

### MODEL_VERSION must be bumped when risk logic changes

`MODEL_VERSION = '2.0.0'` is stored on every `Report`. When the condition engine output
shape changes (new fields, removed fields, changed thresholds), bump this version and
add a recalculation path in `storage.ts` so that stale reports are recomputed on load.

Do not bump MODEL_VERSION for UI-only changes.

### AsyncStorage key namespace

| Key | Content |
|---|---|
| `@husoga:reports` | `Record<id, Report>` serialised as JSON |
| `@husoga:settings` | `AppSettings` JSON (`locale`, `purchased`) |
| `@husoga:dev_unlock` | `"true"` or `"false"` string |

Reports are stored as a single JSON blob keyed by UUID. This is fine for v1 (tens of
reports). For large report counts, migrate to per-key storage or SQLite — but this
is not needed until usage warrants it.

---

## Condition Engine

`src/core/services/riskEngine.ts` — pure function, no side effects, no React/AsyncStorage imports.

**Thresholds:**
- `age / lifespan > 0.7` → `levelAttention` (Kräver uppmärksamhet)
- `age / lifespan > 0.9` → `levelPriority` (Kräver åtgärd)

**Special drainage rule:**
Houses built 1965–1985 with `grundlaeggning === 'betongplatta'` get an automatic
drainage flag — but only if no drainage flag already exists from the `draneringAge`
input. This reflects the known risk profile of slab foundations from this era.

**Testing:** All engine changes must be covered by `__tests__/riskEngine.test.ts`.
Run with:
```bash
npm test
# or a single file:
npx jest __tests__/riskEngine.test.ts
```

---

## IAP — RevenueCat

**SDK:** `react-native-purchases@9.15.2`  
**Entitlement:** `pro`  
**Product ID:** `com.husoga.pro` (both iOS and Android)

The SDK is initialised once in `app/_layout.tsx` via `Purchases.configure()`.
API keys are injected at build time from EAS environment variables:
- `REVENUECAT_IOS_API_KEY` (sensitive, production scope)
- `REVENUECAT_ANDROID_API_KEY` (sensitive, production scope)

These are never in git. To add or rotate them:
```bash
eas env:create --scope project --name REVENUECAT_IOS_API_KEY --value "appl_xxx" --visibility sensitive --environment production
```

**Dev unlock:** Settings screen has a hidden dev unlock (tap version number 5×) that
bypasses the IAP gate without a purchase. Controlled by `@husoga:dev_unlock` in
AsyncStorage. Never shown in production UI.

---

## i18n

All UI strings go through `i18n.t('key')` from `src/i18n/translations.ts`.  
Supported locales: `en`, `sv`. Default: `sv`.

The `sv` object is typed as `typeof en` — TypeScript will fail to compile if a key
exists in `en` but is missing from `sv`. Add new strings to **both** locale objects.

Locale is persisted via `SettingsContext` → AsyncStorage. Changing locale re-renders
immediately via context.

---

## Two TypeScript Configs

| File | Used by | `moduleResolution` |
|---|---|---|
| `tsconfig.json` | Expo / Metro | `bundler` |
| `tsconfig.test.json` | Jest / ts-jest | `node` |

**Do not remove `tsconfig.test.json`.** Metro's `bundler` resolution is incompatible
with Node/Jest. Without the test config, all Jest imports will fail.

---

## Navigation (Expo Router)

File-based routing under `app/`. Key navigation patterns:

```ts
router.push('/form')                                    // new report
router.push({ pathname: '/form', params: { reportId } }) // edit existing
router.push({ pathname: '/result', params: { reportId } }) // view result
```

`useFocusEffect` in `index.tsx` reloads the report list every time the screen comes
into focus. This is intentional — it ensures the list is fresh after create/edit/delete.

---

## New Architecture

`newArchEnabled: false` in `app.json`.

`react-native-purchases@9.15.2` does not support React Native's New Architecture
(Fabric / JSI bridge). Re-enable New Architecture only after RevenueCat confirms
support — check their changelog before upgrading.

---

## Known Gotchas

**EAS submit — iOS 401:** If `eas submit --platform ios` fails with 401, ensure
`eas.json` has `ascApiKeyPath`, `ascApiKeyId`, and `ascApiKeyIssuerId` all set.
EAS requires all three when any one is specified. The `.p8` file is at
`~/Downloads/AuthKey_X6FR57N2NT.p8`.

**Android "draft app" error on first submit:** Google Play's API refuses non-draft
releases for brand-new apps. The first AAB must be uploaded manually via Play Console UI.
All subsequent `eas submit --platform android` calls work non-interactively.

**Build number conflict:** If `eas submit --platform ios` fails with "build number
already used", trigger a new build — `autoIncrement: true` in the production profile
will bump it automatically.

**expo-in-app-purchases is dead:** Do not re-add it. Its Android `build.gradle`
hardcodes `compileSdkVersion 33`, which is incompatible with Expo SDK 54+. It was
removed from the Expo monorepo entirely. Use RevenueCat.

---

## Future Upgrade Paths

### React Native New Architecture
When `react-native-purchases` adds New Architecture support, set `newArchEnabled: true`
in `app.json` and run a full test pass. No code changes should be needed beyond that.

### AsyncStorage → SQLite
If report counts grow large (100+), migrate from a single JSON blob to SQLite using
`expo-sqlite`. The migration path: on first launch after the upgrade, read the existing
blob, write each report as a row, then delete the old blob.

### Cross-device sync
The natural path is iCloud (iOS) + Google Drive (Android) using `expo-file-system` +
platform-specific sync APIs, or a lightweight backend (Supabase / PocketBase). No
account system is needed — a random UUID per install is sufficient as a sync key.

### Boka besiktning CTA
A potential second revenue stream: a "book an inspector" CTA on the result screen.
This would be a separate product, not a feature bolt-on. See `docs/strategy.md` for
the full vision. Legal requirement: any marketplace handling payments requires an AB
and verified SBR credentials for all listed besiktningsmän.

### SDK upgrades
Before upgrading `expo` or `react-native-purchases`, check:
1. `react-native-purchases` changelog for New Architecture / SDK compatibility
2. Expo SDK changelog for `compileSdkVersion` requirement changes
3. Run `npm test` after upgrade — the 58 tests are the fastest regression check
