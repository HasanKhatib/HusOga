# Risk Engine v2 Spec

Related: #16
Task: #21

## Goals

- Replace step thresholds with a continuous deterioration curve.
- Make scoring explicitly weight-based (BCI-style aggregation).
- Keep outputs explainable (flags + triggeredBy + contributionPercent).
- Keep the model defensible: use "informed by" language; avoid "validated" claims.

Non-goals (v2):
- Adding new input fields beyond what exists in `HouseInputs`.
- A backend, accounts, or syncing.

## Current Inputs (v2 scope)

From `HouseInputs`:
- `byggnadsar` (build year)
- `grundlaeggning` (foundation type)
- `yttertakType`, `yttertakAge`
- `fasadType`, `fasadAge`
- `draneringAge?`
- `vatrumAge?`
- `uppvarmning`
- `ventilation`
- `size` (used for facade cost scaling)

## Outputs (unchanged shape)

`RiskOutput`:
- `score` 0–100
- `scoreBand` (keep current: low / medium / high)
- `lifecycleFlags[]`
- `costBand` (min/likely/max SEK)
- `negotiationChecklist[]`

## Model Overview

We compute a component condition score `Ci` in [0..1] per component, adjust by defect multipliers, aggregate by weights, then scale to [0..100].

1. Component condition (continuous deterioration):

```
ratio = age / lifespan
Ci = f(ratio)
```

2. Defect multipliers (risk modifiers):

```
Ci' = clamp01(Ci * Mi)
```

3. Weighted aggregation (BCI-style):

```
Score = round( 100 * Σ (Wi * Ci') )
```

4. Cost exposure coupling (expected exposure):

```
p = failureProbability(Ci')
CostExposure = Σ (p * replacementCostRange)
```

## Components Included

We only score components we can support with existing inputs:
- Roof
- Facade (skipped for `tegel` because `lifespan = null`)
- Drainage (only if `draneringAge` provided; plus special rule)
- Wet rooms (only if `vatrumAge` provided)
- Ventilation (type-based)
- Heating (type-based)

## Weights (Wi)

Weights must sum to 1.0.

Proposed v2 weights (based on importance to moisture/maintenance risk and current app scope):

| Component | Weight |
|---|---:|
| roof | 0.20 |
| wetRooms | 0.20 |
| drainage | 0.15 |
| facade | 0.10 |
| ventilation | 0.15 |
| heating | 0.10 |
| foundationModifierBucket | 0.10 |

Notes:
- `foundationModifierBucket` is not a standalone condition from age; it is a bounded risk bucket derived from `grundlaeggning` + `byggnadsar` that contributes as a component condition in [0..1]. This avoids "hidden" modifiers that are hard to explain.
- If we later add more inputs (windows/gutters/heat pump), re-normalize weights.

## Continuous Deterioration Curve f(ratio)

We use a piecewise-linear curve that is continuous and non-linear (accelerates near end-of-life).

Let `r = ratio = age / lifespan`.

```
f(r) =
  0.00                       when r <= 0.00
  lerp(0.00, 0.20, r/0.50)    when 0.00 < r <= 0.50
  lerp(0.20, 0.40, (r-0.50)/0.20) when 0.50 < r <= 0.70
  lerp(0.40, 0.70, (r-0.70)/0.20) when 0.70 < r <= 0.90
  lerp(0.70, 0.90, (r-0.90)/0.20) when 0.90 < r <= 1.10
  lerp(0.90, 1.00, min((r-1.10)/0.40, 1.0)) when r > 1.10
```

This keeps the same intuitive breakpoints (0.7 and 0.9) but avoids abrupt jumps.

## Type-Based Components

Some components are not age-based in current scope:

- Ventilation:
  - `ftxMekanisk` → `Ci = 0.10`
  - `fMekanisk` → `Ci = 0.20`
  - `sjalvdrag` → `Ci = 0.55` (known moisture risk pattern)

- Heating:
  - `direktverkandeEl` → `Ci = 0.45`
  - otherwise → `Ci = 0.15`

These values are intentionally conservative and must be presented as "risk indicators", not definitive faults.

## Foundation Risk Bucket

Compute `Cfoundation` in [0..1] from `grundlaeggning` + `byggnadsar`.

Proposed mapping:

- `betongplatta` + build year 1965–1985 → `0.55`
- `krypgrund` → `0.50`
- `kallare` → `0.35`
- `suterrang` → `0.40`
- `other` → `0.25`
- `betongplatta` outside 1965–1985 → `0.30`

This bucket replaces the current "auto drainage flag" as a continuous contributor, but we still add a discrete drainage flag for explainability (see flags).

## Defect Multipliers (Mi)

Multipliers should be small (1.05–1.25) and only applied when justified and explainable.

Initial v2 multipliers:

- If `grundlaeggning === 'betongplatta'` and `byggnadsar in [1965, 1985]`:
  - Drainage: `M = 1.15` (if drainage is computed)
  - Wet rooms: `M = 1.05` (small moisture-related bump)

- If `ventilation === 'sjalvdrag'`:
  - Wet rooms: `M = 1.10` (moisture risk coupling)

All multipliers are clamped via `clamp01`.

## Flags (LifecycleFlag)

We keep two levels: `risk` and `highRisk`.

Flag thresholds (based on adjusted condition `Ci'`):
- `highRisk` when `Ci' >= 0.70`
- `risk` when `Ci' >= 0.40`

Each flagged component emits:
- `messageKey`: reuse current keys (`roofRisk`, `roofHighRisk`, etc.)
- `triggeredBy`: all inputs used for that component
- `contributionPercent`: computed from weighted contribution share:

```
contrib_i = Wi * Ci'
percent_i = round(100 * contrib_i / Σ contrib_all)
```

Notes:
- Normalize so displayed percents sum to ~100 across flags; allow off-by-1 rounding.
- Only components that produce a flag participate in the percent normalization.

## Special Rules (Explainability)

Keep a dedicated messageKey for the known slab-era risk pattern:
- If `byggnadsar in 1965–1985` and `grundlaeggning === 'betongplatta'`:
  - Add a drainage-related flag with `messageKey = betongplatta70s` and triggeredBy `[byggnadsar, grundlaeggning]`.

This remains even though foundation risk is now a continuous bucket, because it is a key Swedish pattern worth surfacing to the user.

## Cost Exposure (Expected Value)

For each component with a defined replacement cost range `[min, max]`, compute probability `p` from `Ci'`:

```
p = clamp01( (Ci' - 0.40) / 0.60 )
```

Then compute exposure contributions:

```
minExposure += round(p * min)
maxExposure += round(p * max)
likelyExposure += round(p * ((min + max)/2))
```

Notes:
- This makes cost continuous even before flags trigger.
- For facade, keep `cost ~= size * costPerSqm` and treat it as the range base.

## Score Bands

Keep existing bands for now:
- score < 30 → low
- score < 60 → medium
- otherwise → high

If we later add `critical`, it is a UI + translation change and should be its own issue.

## Examples (Sanity Cases)

These are not exact expected scores yet (until implemented), but they should land in the right band and flag set.

1) Modern, low risk
- byggnadsar: 2020
- krypgrund
- roof: betongpannor age 2 (lifespan 30)
- facade: tegel (skipped)
- ventilation: ftxMekanisk
- heating: bergvarme
- no drainageAge, no wetRoomsAge
Expected:
- scoreBand: low
- no highRisk flags

2) Typical 70s slab house
- byggnadsar: 1975
- betongplatta
- ventilation: sjalvdrag
- roof age 20/30
- wetRoomsAge 18/20
- no drainageAge
Expected:
- drainage pattern flag (betongplatta70s)
- wetRooms risk/highRisk
- scoreBand: medium to high

3) Overdue maintenance
- byggnadsar: 1968
- betongplatta
- roof takpapp age 22/20
- facade puts age 35/30
- drainageAge 30/25
- wetRoomsAge 28/20
- ventilation sjalvdrag
- heating direktverkandeEl
Expected:
- multiple highRisk flags
- scoreBand: high
- costBand: high exposure
