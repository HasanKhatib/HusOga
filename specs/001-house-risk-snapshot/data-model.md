# Data Model: House Risk Snapshot

**Branch**: `001-house-risk-snapshot` | **Date**: 2026-02-23

## Entities

### Report

Root entity stored in Hive. One per house assessment.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | string (UUID) | Yes | Unique identifier; generated on create |
| houseLabel | string | No | User-editable (e.g. address); max 200 chars |
| inputs | HouseInputs | Yes | Embedded object |
| outputs | RiskOutput | Yes | Computed; persisted after each recompute |
| timestamp | DateTime | Yes | Last updated (ISO 8601) |
| modelVersion | string | Yes | Semantic version of risk logic (e.g. "1.0.0") |

**Uniqueness**: `id` is unique per device.
**Lifecycle**: Create → Edit (recompute) → Delete. No archival.

---

### HouseInputs

Embedded in Report. All user-entered building data.

| Field | Type | Required | Validation | Notes |
|-------|------|----------|------------|-------|
| byggnadstyp | enum | Yes | One of: suterränghus, enplanshus, flerplanshus, radhus, etc. | specs.md Inputs table |
| byggnadsår | int | Yes | 1800–current year | Build year |
| size | double | Yes | 10–2000 | Living area m² |
| grundläggning | enum | Yes | One of: källar/ytterväggar, betongplatta, torpargrund, etc. | specs.md |
| yttertakType | enum | Yes | Betongpannor, tegeltak, plåttak, takpapp, gummiduk, etc. | specs.md |
| yttertakAge | int | Yes | 0–150 | Years since new/renewal |
| fasadType | enum | Yes | Tegel, trä, puts, blandad | specs.md |
| fasadAge | int | Yes | 0–150 | Years since målning/omputsning |
| uppvarmning | enum | Yes | Direktverkande el, luft/luft värmepump, bergvärme, fjärrvärme, etc. | specs.md |
| ventilation | enum | Yes | Självdrag, frånluft, FTX/mekanisk | specs.md |
| houseLabel | string | No | — | Duplicate of Report.houseLabel for form binding |
| stomme | enum | No | Trä, lättbetong, tegel, etc. | Optional |
| siteType | enum | No | Berg, sand, lera | Optional |
| hangrannorAge | int? | No | 0–150 | Gutters; optional |
| fonsterType | enum? | No | 2-glas, 3-glas, isolerglas | Optional |
| fonsterAge | int? | No | 0–150 | Optional |
| draneringAge | int? | No | 0–150 | Optional |
| vatrumAge | int? | No | 0–150 | Optional |
| skorsten | bool? | No | — | Has chimney |
| skorstenSealAge | int? | No | 0–150 | Optional |
| luftvarmepumpAge | int? | No | 0–150 | Optional |

---

### RiskOutput

Computed from HouseInputs. Stored with Report for persistence.

| Field | Type | Notes |
|-------|------|-------|
| score | int | 0–100 |
| scoreBand | enum | Low, Medium, High (derived from score thresholds) |
| lifecycleFlags | List\<LifecycleFlag\> | Roof, drainage, facade, ventilation, heating, wet rooms |
| costBand | CostBand | min, likely, max (SEK) |
| negotiationChecklist | List\<String\> | Basic checklist items |

---

### LifecycleFlag

| Field | Type | Notes |
|-------|------|-------|
| component | enum | roof, drainage, facade, ventilation, heating, wetRooms |
| level | enum | risk, highRisk |
| triggeredBy | List\<String\> | Input field names that contributed |
| contributionPercent | int | 0–100; share of overall score |
| messageKey | string | For l10n (en/sv) |

---

### CostBand

| Field | Type | Notes |
|-------|------|-------|
| min | int | SEK |
| likely | int | SEK |
| max | int | SEK |

---

### AppSettings (non-report)

Stored separately (Hive box or SharedPreferences for simple key-value).

| Field | Type | Notes |
|-------|------|-------|
| locale | string | "en" or "sv" |
| purchased | bool | One-time IAP unlock; when true = unlimited reports. Paid value = detailed breakdown + negotiation pack. |

---

## Validation Rules (FR-016)

- Build year: 1800 ≤ value ≤ current year
- Living area: 10 ≤ value ≤ 2000
- All age fields: 0 ≤ value ≤ 150
- Required enum fields: must be non-null and in allowed set
- Block submit on any violation; show inline error

---

## State Transitions

- **Report**: draft (inputs incomplete) → computed (outputs present) → deleted
- **AppSettings.locale**: set on first launch (device locale or fallback), updated on user change
- **AppSettings.purchased**: false by default; set true on manual unlock (v1) or IAP (future)
