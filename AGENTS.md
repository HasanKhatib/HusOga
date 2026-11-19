# AGENTS.md — HusÖga

Instructions for AI agents (Claude Code and others) working in this repo.

## Project overview

HusÖga is an offline-only React Native (Expo, TypeScript) mobile app that estimates Swedish single-family home maintenance risks from user-entered house data. No backend, no accounts, no tracking. iOS (App Store) and Android (Google Play). Migrated from Flutter — Flutter source is preserved on the `flutter-archive` branch.

**Primary tension:** domain and legal defensibility vs. product simplicity and ship speed — stay honest about what the app is (disclaimers, no false authority), respect Swedish building terminology and risk logic, while staying a small offline consumer tool.

## Always apply

- Task state lives on the agentkan board in `docs/board/` (see **Roadmap board**). Read `docs/board/next.json` and the active epics at session start.
- At the end of every session run the agentkan handoff (`.claude/skills/agentkan/references/handoff.md`): set statuses to reality, refresh `docs/board/next.json` (where things stand, immediate next step, open threads, risks), validate.
- Never delete or overwrite core project documents without explicit instruction.
- Keep AI writes inside this repo directory.

## Hard rules

- Do not push to remote, publish, or release without explicit instruction.
- Ask before any irreversible action (store submission, IAP changes, EAS releases, deleting, deprecating).
- Risk engine output (scores, thresholds, lifespan data) must stay consistent with `MODEL_VERSION` in `riskEngine.ts` (currently `2.0.0`) — bump it when semantics change (saved reports are stamped with it).
- All user-facing text needs both `sv` and `en` translations before shipping.
- Disclaimers must remain present — this tool estimates, it does not certify.

## Roadmap board (agentkan)

- Board directory: `docs/board/` (`roadmap.json` state, `next.json` focus, `epics/<ID>.md` prose, `archive.json` finished epics).
- Claude Code config is committed in `.claude/` (`settings.json` permissions + board-validation hook, `agents/council.md` subagent, `skills/agentkan/`). Personal overrides go in `.claude/settings.local.json` (gitignored).
- Skill: `.claude/skills/agentkan/` — follow it for adding/refining epics, migrations and handoff.
- After every board edit run `npx agentkan validate docs/board`. Humans operate the board with `npx agentkan serve docs/board`.
- **AI proposes, human disposes:** never mark an epic `done`, archive, delete or reorder wholesale unless asked in that turn.

## Workflow (GitHub Issues)

Use GitHub Issues for all meaningful work so changes are easy to audit and revert.

- Create or pick an issue before making changes (feature/bug/refactor/deps/design); small chores can share a meta issue.
- Work in board priority order unless the user overrides.
- Every issue links to an epic (or meta) in the body: `Related: #<epic>`.
- Every commit subject references an issue: `fix(ui): align theme chips (refs #123)`.
- When closing an issue or completing a milestone, update `## Project Status` in `README.md` in the same commit.

## Load on demand

| File | Load when |
|---|---|
| `agents/council.md` | A non-trivial decision needs deliberation |
| `agents/povs/the-skeptic.md`, `the-editor.md`, `the-shipper.md`, `the-user.md` | Loaded automatically with council |
| `agents/templates/decision-packet.md` | Preparing a council session |
| `docs/board/roadmap.json` | Checking status or planning next milestone |
| `docs/risk-logic/engine-v2.md` | Changing the risk engine |
| `docs/product/report-content.md` | Changing free vs Pro report content |
| `docs/history.md`, `docs/strategy.md` | Past decisions; product vision |
| `docs/deployment.md`, `docs/commerce/` | Builds and store submission; store account/IAP setup |
| `docs/marketing/` | Store copy, privacy policy, website, screenshots |

**Council triggers:** any irreversible action; autonomous scope expansion beyond the current task; external integrations or new dependencies; significant time/cost commitment with unclear return.

## Commands

```bash
npm install            # install dependencies
npm run start          # Expo dev server (Metro)
npm run ios            # iOS simulator
npm run android        # Android emulator
npm run test           # Jest unit tests (pure TS, Node, no Expo)
npm run typecheck      # tsc --noEmit
npx jest __tests__/riskEngine.test.ts            # single file
npx jest --testNamePattern "betongplatta"        # single test
```

No codegen, no pre-commit hooks. EAS production builds (ask first):
`eas build --platform ios|android --profile production`. EAS project: `https://expo.dev/accounts/hasankhatib/projects/husoga`. Bundle ID: `com.husoga.app`.

## Definition of done

Before calling work finished: `npm run typecheck` and `npm test` pass; new user-facing strings exist in both `sv` and `en`; disclaimers intact; `MODEL_VERSION` bumped if risk semantics changed; board validated and `next.json` refreshed. Prefer fixing the root cause over adding workarounds, and keep changes scoped to the task.

## Architecture

```
app/                    Expo Router screens (file-based routing)
  (tabs)/               index (saved reports), new (form entry), settings
  form.tsx              House data entry (auto-save)
  result.tsx            Konditionsöversikt (traffic-light + viewing tips)
  detailed.tsx          Detailed report (Pro): decision points, cost forecast, lifetime analysis
  paywall.tsx           RevenueCat paywall
  sources.tsx           Curated sources
  webview.tsx           Privacy policy / external links
src/
  context/SettingsContext.tsx   Language/units/theme settings
  core/
    data/                costs.ts (SEK), lifespans.ts (per component + era), sources.ts
    models/types.ts      Shared types (HouseData, RiskReport, ComponentResult…)
    services/            riskEngine.ts, storage.ts, iap.ts/iapConfig.ts/purchase.ts, settings.ts
    validation.ts        Input validation
    utils/uuid.ts
  i18n/translations.ts   sv (default) + en
  screens/               Screen components used by app/ routes
  ui/                    theme.ts, ThemeProvider.tsx, components.tsx
__tests__/               riskEngine.test.ts, validation.test.ts
docs/                    board/, history, strategy, deployment, risk-logic, product, commerce, marketing
plugins/withAndroidBillingPermission.js   EAS plugin for Android billing permission
```

**Key models:** `HouseData` (form values), `ComponentResult` (per-component green/yellow/red, risk score, cost estimate), `RiskReport` (components + metadata + `MODEL_VERSION`).

### Details worth knowing

- **TypeScript configs:** `tsconfig.json` (Metro, `moduleResolution: bundler`) and `tsconfig.test.json` (Jest/ts-jest, node/CommonJS). Do not remove `tsconfig.test.json`.
- **Routing:** `router.push('/form')`, `router.push({ pathname: '/form', params: { reportId } })`, `router.push({ pathname: '/result', params: { reportId } })`. `useFocusEffect` reloads the report list on focus.
- **i18n:** all UI strings via `i18n.t('key')`; add to both locales (`sv` is typed as `typeof en`). Locale persists via `SettingsContext` → AsyncStorage.
- **AsyncStorage keys:** `@husoga:reports` (`Record<id, Report>` JSON), `@husoga:settings`, `@husoga:dev_unlock`.
- **Risk engine:** `riskEngine.ts` is pure (no React/AsyncStorage imports), safe to test in Node. Deterioration curves, component weights, defect multipliers; traffic-light output, no aggregate score.
- **Swedish field names** (`byggnadstyp`, `byggnadsar`, `grundlaeggning`, `yttertakType`, `betongplatta`…) must not be anglicized — they are persisted, so renaming is a breaking schema change.
- **IAP:** one non-consumable `com.husoga.pro` via RevenueCat (`react-native-purchases`). Free: traffic-light + viewing tips + max 2 saved reports. Pro: everything else.

## Known gotchas

- **New Architecture is off** (`newArchEnabled: false` in `app.json`): `react-native-purchases` doesn't support it. Re-enable only after RevenueCat confirms support. Before upgrading `expo` or `react-native-purchases`, check their changelogs (and Expo's `compileSdkVersion` changes), then run `npm test`.
- **`eas submit` iOS 401:** `eas.json` needs `ascApiKeyPath`, `ascApiKeyId` and `ascApiKeyIssuerId` all set. Keep the `.p8` key out of the repo.
- **Android first release:** Play's API rejects non-draft releases for new apps — the first AAB must be uploaded manually in Play Console; later `eas submit` calls work.
- **iOS "build number already used":** trigger a new build (`autoIncrement: true` bumps it).
- **Never re-add `expo-in-app-purchases`** (dead; breaks on Expo SDK 54+). Use RevenueCat.
- **Storage scale:** a single AsyncStorage JSON blob is fine for v1; consider `expo-sqlite` if reports reach 100+.

## Legal constraints

Every release must show: *"Not a replacement for a professional inspection."* and *"Not affiliated with Boverket or Folkhälsomyndigheten."* Never claim "BBR-compliant", "Official risk rating" or "Approved". The disclaimer lives under key `disclaimer` in both locales and is shown on `result.tsx`.
