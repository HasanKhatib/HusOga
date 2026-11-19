# Council

The council is a structured deliberation protocol for non-trivial decisions. Four seats, each holding a distinct lens. Not a vote — a pressure test.

## Primary tension

Domain and legal defensibility vs. product simplicity and ship speed — the app must stay honest about what it is (disclaimers, no false authority), respect Swedish building terminology and risk logic, while staying a small offline consumer tool. (A tight alternative: correctness of risk semantics vs. UX friction.)

## When to invoke

- An irreversible action: publishing, deleting, deprecating, tagging a release
- Autonomous scope expansion beyond the current task
- External integrations or new dependencies
- Significant time or cost commitment with unclear return

## Active seats

| Seat | File | Role |
|---|---|---|
| **The Skeptic** | `agents/povs/the-skeptic.md` | Challenges the premise and tests assumptions |
| **The Editor** | `agents/povs/the-editor.md` | Guards simplicity and cuts accumulation |
| **The Shipper** | `agents/povs/the-shipper.md` | Strategic — goal alignment and momentum |
| **The User** | `agents/povs/the-user.md` | Domain/values — expertise and constraints |

## Protocol

1. State the decision in one sentence
2. Load `agents/templates/decision-packet.md` and fill it in
3. Run each seat in order: Skeptic → Editor → The Shipper → The User
4. Each seat returns its verdict and findings
5. Proceed only if no seat returns Block or Stop

## Guardrails

- Default is fine: AI writes stay within this repo directory. If you want it stricter later: e.g. AI-generated or heavily AI-edited docs only under docs/; app code only under app/ and src/ — but for scaffold setup, the default matches AGENTS.md's "only Build edits files" workflow
- No publishing, pushing to remote, or tagging releases without human confirmation
- If two or more seats return a blocking verdict, stop and surface the conflict

## Verdict mapping

| Combined signal | Action |
|---|---|
| All proceed | Build |
| One pause, rest proceed | Address the pause before building |
| Any reframe | Stop, restate the decision, re-run |
| Any block or stop | Surface to human before proceeding |
