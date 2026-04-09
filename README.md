# HusOga

Offline-only Swedish villa risk assessment app built with React Native + Expo.

## Dev

```bash
npm install
npm test
npm start
```

## Workflow (GitHub Issues)

We track work via GitHub Issues so changes are easy to audit, revert, and hand off.

Rules:
- Create or pick an issue before making changes (feature/bug/refactor/deps/design).
- Small chores can be grouped under a single meta issue.
- Every commit message must reference an issue: add `refs #<issue>` in the subject.
  Example: `fix(ui): align theme chips (refs #123)`
- When a change spans multiple issues: `refs #12, #34`.

## Roadmap

See `docs/roadmap.md`.

## Architecture

- `app/` Expo Router routes (tabs + stack)
- `src/core/` models + risk engine + persistence
- `src/ui/` theme + shared UI components

Flutter v1 source is preserved on the `flutter-archive` branch.
