# Sources & Citation Log

**Branch**: `001-house-risk-snapshot` | **Date**: 2026-02-23

Risk engine logic is derived from Swedish building norms. **Do not embed copyrighted text.** Store only our own derived tables (numbers, assumptions) in code. This file documents sources, access dates, what we derived, and what we did *not* copy verbatim.

---

## SBR BILAGA 3 (Tekniska medellivslängder)

| Field | Value |
|-------|-------|
| **Title** | BILAGA 3 — Tekniska medellivslängder |
| **Publisher** | SBR (Svenska Byggingenjörers Riksförbund) / Byggingenjörerna |
| **Context** | SBR överlåtelsebesiktning, Meddelande M84:10; SABO-avskrivningsregler |
| **Access date** | [To be filled when sourcing] |

**What we derive:**
- Lifespan values (years) for roof types, gutters, facade materials, windows, drainage, wet rooms, chimney seal, heat pump
- Cost ranges (SEK) for component replacement (min/max bands)
- Threshold rules: age/lifespan > 0.7 → flag; > 0.9 → high risk

**What we do NOT copy verbatim:**
- Full table layouts, explanatory prose, or any original wording from the document
- We store our own derived lookup tables in `lib/core/data/` with numeric values only

---

## BBR (Boverkets byggregler)

| Field | Value |
|-------|-------|
| **Title** | Boverkets byggregler (BBR) |
| **Publisher** | Boverket |
| **Context** | Hygien, hälsa och miljö; ventilation requirements |
| **Access date** | [To be filled when sourcing] |

**What we derive:**
- Conceptual guidance for ventilation/air quality importance
- No verbatim regulation text; we write our own explanatory copy

**What we do NOT copy verbatim:**
- Regulation text, BBR section quotes

---

## Folkhälsomyndigheten

| Field | Value |
|-------|-------|
| **Title** | Public health guidance on ventilation, moisture, mould |
| **Publisher** | Folkhälsomyndigheten |
| **Context** | Indoor environment, dampness, health risks |
| **Access date** | [To be filled when sourcing] |

**What we derive:**
- Guidance themes: moisture/mould indicators, recommended actions
- Our own phrasing for "what to ask for" and "what bad looks like"

**What we do NOT copy verbatim:**
- Official guidance text or brochure content

---

## License & Usage

- All app copy and derived data must be our own wording and tabular summaries.
- We reference these sources in UI as "informed by" or "aligned with" — never implying endorsement.
- See constitution: "Not affiliated with Boverket/Folkhälsomyndigheten."
