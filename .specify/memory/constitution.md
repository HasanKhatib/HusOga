# House Risk Snapshot — Constitution

**Version:** 1.0.0  
**Platform:** Flutter (mobile only)  
**Source of truth:** `specs.md` (product) at repo root; `specs/[branch]/spec.md` (feature specs). **Guides:** `docs/` (testing, release)

---

## 1. Project Identity

- **What:** Mobile app for Swedish pre-purchase villa buyers. Delivers actionable risk recommendations aligned with Swedish building norms (BBR, OVK, Folkhälsomyndigheten).
- **Not:** Official approval, BBR compliance claim, or authority affiliation. Not a replacement for professional besiktning.
- **Positioning:** “Recommendations informed by Swedish building regulations guidance (BBR) and public health guidance.”

---

## 2. Platform & Architecture

- **Flutter only.** Cross-platform mobile (iOS + Android). No web app.
- **No backend.** Local storage only. Reports saved per house on device.
- **No user accounts.** No cloud sync. Data stays on device.
- **Minimal dependencies.** Prefer Flutter/Dart stdlib; add packages only when necessary.

---

## 3. Source of Truth

- **specs.md** (repo root) — Product spec: inputs, outputs, component model (BILAGA 3), free vs paid packaging, authority anchors.
- **specs/[branch]/spec.md** — Feature spec for each branch.
- **specs/[branch]/sources.md** — Citation log for BILAGA 3, BBR, Folkhälsomyndigheten; what we derived vs. what we did not copy. Do not embed copyrighted text.
- All generated code and UI must conform to specs. Do not introduce features or abstractions not in specs.

---

## 4. Code Quality

- Readable by a single operator. No black-box logic.
- Every feature must have a clear removal path.
- No premature optimization. Prefer simple over clever.
- Tests: focus on risk engine logic; UI tests only where critical.
- **Test after each implementation phase.** Do not proceed to the next phase until the current phase's checkpoint passes (`flutter test` and manual run on device/simulator). Validate incrementally.

---

## 5. Monetization

- **One-time IAP only.** No ads. No subscription.
- Price: 99–149 SEK for full report unlock.
- Free tier: score + lifecycle flags + basic checklist. Paid: full report, PDF export, reference-backed checks.

---

## 6. Data & Storage

- Use `shared_preferences` or `hive` (or similar) for local report storage.
- Each report: house label, inputs, outputs, timestamp, **model_version**.
- **Data versioning:** Include `model_version` in every report so we can detect reports from outdated risk logic and prompt re-run if needed.
- No sensitive personal data. No analytics without explicit consent.
- Swedish locale by default (SEK, Swedish terms).

---

## 7. Explainability

- **Show triggers + contributions.** For each risk flag, display: (1) which inputs triggered it, (2) how much it contributed to the score.
- No black-box logic. User should understand why a component is flagged and how the score was derived.
- Use "Why it matters" and "What bad looks like" from specs for each flag.

---

## 8. v1 Inputs & Non-Goals

**v1 inputs (must have):** Byggnadstyp, Byggnadsår, Size (m²), Grundläggning, Yttertak type/age, Fasad type/age, Uppvärmning, Ventilation. Optional: House label, Fönster age, Dränering age, Våtrum age, Skorsten.

**v1 non-goals:** OVK lookup, PDF export.

**App Store note:** On iOS, unlocking paid features typically requires In-App Purchase. Manual unlock (codes, external purchase) can cause App Store rejection except for internal/enterprise distribution.

---

## 9. Release Gate Checklist

Before every release:

- [ ] Constitution compliance (no backend, no ads, legal copy)
- [ ] Risk engine tests pass
- [ ] model_version in all reports
- [ ] Explainability: triggers + contributions visible for each flag
- [ ] Swedish locale; SEK formatting
- [ ] docs/release/ checklist completed

---

## 10. Legal & Copy

- Never claim “BBR-compliant”, “Official risk rating”, or “Approved”.
- Always include: “Not a replacement for professional inspection.” “Not affiliated with Boverket/Folkhälsomyndigheten.”
- Reference BBR, OVK, Folkhälsomyndigheten as sources; do not imply endorsement.

---

## 11. Governance

- **Amendments:** Update this file when principles change; bump version.
- **Compliance:** Before each release, verify outputs match specs and constitution.
- **Scope:** If a change conflicts with specs or constitution, reject or amend first.

---

## 12. Non-Negotiables

- Mobile-only, Flutter, local storage.
- specs.md drive implementation.
- No backend, no accounts, no cloud sync.
- Swedish market, Swedish terminology and norms.
- spec.md = feature spec; specs.md = product spec. Use consistent naming.
