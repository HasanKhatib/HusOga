# AGENTS.md — house-risk-snapshot (HusÖga)

React Native / Expo app (TypeScript). Offline-only Swedish villa risk assessment tool. No backend, no network, no accounts.

Migrated from Flutter — Flutter source is preserved on the `flutter-archive` branch.

---

## Commands

```bash
npm install            # install dependencies
npm test               # run Jest tests (pure TS, no device needed)
npm start              # expo start (scan QR with Expo Go, or press i/a)
npm run ios            # expo start --ios
npm run android        # expo start --android
```

No codegen, no build steps, no pre-commit hooks.

---

## Workflow (GitHub Issues)

Use GitHub Issues for all meaningful work so changes are easy to audit and revert.

Roadmap source of truth: `docs/roadmap.md`.

- Create or pick an issue before making changes (feature/bug/refactor/deps/design).
- Small chores can be grouped under one meta issue.
- Prefer working in roadmap priority order unless the user explicitly overrides.
- Every issue must link to an epic (or meta) in the body: `Related: #<epic>`.
- Every commit message must reference an issue in the subject: `refs #123`.
  Example: `fix(ui): align theme chips (refs #123)`

## Running a Single Test File

```bash
npx jest __tests__/riskEngine.test.ts
npx jest --testNamePattern "betongplatta"
```

---

## Project Structure

```
app/                        # Expo Router screens (file-based routing)
│  _layout.tsx              # Root layout: wraps everything in SettingsProvider
│  index.tsx                # Report list (home screen)
│  form.tsx                 # House data entry + auto-save
│  result.tsx               # Score, flags, cost band, checklist
│  settings.tsx             # Language picker + dev unlock
src/
  core/
    models/types.ts         # All TypeScript types and enums (single source of truth)
    data/lifespans.ts       # Component lifespans in years
    data/costs.ts           # Replacement cost ranges in SEK
    services/riskEngine.ts  # Pure function: computeRisk(inputs) → RiskOutput
    services/storage.ts     # AsyncStorage CRUD for reports
    services/settings.ts    # AsyncStorage for AppSettings + dev unlock
    services/purchase.ts    # Free/paid tier gate (IAP STUB — see below)
    validation.ts           # validateNumeric, validateAge, etc.
  context/SettingsContext.tsx  # React context for locale + devUnlock
  i18n/translations.ts     # i18n-js instance with en + sv translations
__tests__/
  riskEngine.test.ts        # 9 tests covering risk engine logic
  validation.test.ts        # 24 tests covering all validation functions
assets/                     # Expo icons / splash (placeholders from scaffold)
```

---

## Two TypeScript Configs

| File | Used by | Module resolution |
|---|---|---|
| `tsconfig.json` | Expo / Metro (app) | `bundler` (Metro-compatible) |
| `tsconfig.test.json` | Jest / ts-jest | `node` (CommonJS) |

**Do not remove `tsconfig.test.json`.** Without it, Jest cannot resolve imports because Metro's `moduleResolution: bundler` is incompatible with Node/Jest.

---

## Routing (Expo Router)

File-based routing under `app/`. Navigation:
- `router.push('/form')` — new report
- `router.push({ pathname: '/form', params: { reportId } })` — edit existing
- `router.push({ pathname: '/result', params: { reportId } })` — view result

`useFocusEffect` in `index.tsx` reloads the list every time the screen comes into focus.

---

## i18n

All UI strings go through `i18n.t('key')` from `src/i18n/translations.ts`. Supported locales: `en`, `sv`. Default: `sv`. Add new strings to **both** locale objects — TypeScript enforces this (the `sv` object is typed as `typeof en`).

Locale is persisted via `SettingsContext` → `AsyncStorage`. Changing locale re-renders immediately via context.

---

## AsyncStorage Key Namespace

| Key | Content |
|---|---|
| `@husoga:reports` | `Record<id, Report>` serialized as JSON |
| `@husoga:settings` | `AppSettings` JSON (`locale`, `purchased`) |
| `@husoga:dev_unlock` | `"true"` or `"false"` string |

Reports are stored as a single JSON blob keyed by UUID. For large report counts a migration to per-key storage or SQLite may be needed, but is not required for v1.

---

## Risk Engine

`src/core/services/riskEngine.ts` — pure function, no side effects, no imports from React or AsyncStorage. Safe to test in Node without any mocking.

Thresholds: `age / lifespan > 0.7` → risk; `> 0.9` → highRisk.
Special rule: `byggnadsar` 1965–1985 + `grundlaeggning === 'betongplatta'` → auto-adds drainage flag (only if no drainage flag already present from `draneringAge` input).

`MODEL_VERSION = '1.0.0'` — stored on every `Report`. Bump when risk logic changes.

---

## IAP (Purchase Service)

`src/core/services/purchase.ts` — `unlockPurchased()` is a **stub** that sets a flag in AsyncStorage. There is no real in-app purchase integration. Before App Store submission, replace with `expo-in-app-purchases`.

---

## Legal Constraints

Every release must show:
> *"Not a replacement for a professional inspection."*
> *"Not affiliated with Boverket or Folkhälsomyndigheten."*

Never claim "BBR-compliant", "Official risk rating", or "Approved". The disclaimer is in both locale files under the key `disclaimer` and shown on `result.tsx`.

---

## Swedish Field Names

Model fields and enum values use Swedish building terminology (`byggnadstyp`, `byggnadsar`, `grundlaeggning`, `yttertakType`, `sjalvdrag`, `betongplatta`, etc.). Do not anglicize them — they are stored in AsyncStorage and changing them is a breaking schema change.
