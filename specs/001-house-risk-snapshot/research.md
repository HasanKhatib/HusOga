# Research: House Risk Snapshot

**Branch**: `001-house-risk-snapshot` | **Date**: 2026-02-23

## 1. Local Storage: Hive vs shared_preferences

**Decision**: Hive

**Rationale**:
- Constitution allows "shared_preferences or hive (or similar)".
- Reports are structured objects (Report, HouseInputs, RiskOutput) with nested data.
- Hive provides typed box storage, JSON-free serialization, and efficient reads for list views.
- shared_preferences is key-value only; storing report JSON strings requires manual parsing and is awkward for list-by-ID queries.
- Hive supports lazy boxes and compactions; suitable for 1–10 reports per device.

**Alternatives considered**:
- **shared_preferences**: Simpler, but poor fit for structured report objects; would need JSON encode/decode and custom list management.
- **SQLite (sqflite)**: Overkill for ≤10 reports; adds dependency and schema migration overhead.
- **Isar**: More powerful but heavier; Hive is sufficient for v1 scale.

---

## 2. Flutter i18n Approach

**Decision**: flutter_localizations + ARB files (l10n package)

**Rationale**:
- Official Flutter approach; generate code from `lib/l10n/app_en.arb`, `app_sv.arb`.
- Supports pluralization, parameterization; required for "X reports" and dynamic text.
- Device locale detection built-in; fallback to Swedish when locale is neither en nor sv (per spec clarification).

**Alternatives considered**:
- **easy_localization**: Popular but adds dependency; ARB is stdlib.
- **Manual Map-based**: Works but no codegen, no compile-time safety.

---

## 3. Form Validation and Recompute Timing

**Decision**: Debounce 500ms + explicit Calculate button; target <1s total latency

**Rationale**:
- Spec: results within 1 second of last edit or explicit Calculate tap.
- Debouncing avoids recompute on every keystroke; 500ms balances responsiveness and CPU.
- Explicit "Calculate" or "See results" button provides clear action when form is ready.
- Risk engine is synchronous; Dart isolate unnecessary for current input count.

**Alternatives considered**:
- **Immediate recompute**: Too aggressive; rapid edits would thrash.
- **Isolate for risk engine**: Not needed for v1; revisit if BILAGA 3 logic grows significantly.

---

## 4. Report Limit Enforcement

**Decision**: Check before create; block with message when limit reached

**Rationale**:
- Spec: free 1 report; one-time paid unlock = unlimited reports.
- On "Create report" action: if free user at limit, show snackbar/dialog explaining upgrade or delete-to-add.
- Paid value = detailed breakdown + negotiation pack; not report count.
- IAP required for App Store; manual unlock risks rejection except for internal/enterprise.

---

## 5. Default Language on First Launch

**Decision**: Device locale if English or Swedish; otherwise Swedish

**Rationale**: Per spec clarification; no additional research required.

---

## 6. Risk Engine Source Handling

**Decision**: Do not embed copyrighted text. Use `sources.md` citation log.

**Rationale**:
- SBR BILAGA 3, BBR, Folkhälsomyndigheten are referenced; we derive numeric values and rules.
- Store only our own derived tables (lifespans, costs, thresholds) in `lib/core/data/`.
- Document in `sources.md`: title, publisher, access date, what we derived, what we did not copy verbatim.
