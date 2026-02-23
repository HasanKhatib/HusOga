# Specs: House Risk Snapshot

Aligned with SBR överlåtelsebesiktning (överlåtelsebesiktningsutlåtande): handlingar, okulär besiktning, riskanalys. Reference: professional besiktning (e.g. Midtorn Byggkonsult, SBR Byggingenjörerna).

## Platform

**Mobile only.** Flutter. No web app.

## Local Storage

Reports are saved per house in local device storage (no account, no cloud).

- Each report: house label (user-editable, e.g. address), inputs, outputs, timestamp, **model_version**
- **model_version:** Included so reports from outdated risk logic can be detected; prompt re-run if needed
- List view: all saved reports; tap to open, edit, or delete
- Data stays on device; survives app restart
- No sync across devices

## Primary Flow

1. User creates new report or opens saved report
2. User enters house basics (byggnadstyp, year, size, grundläggning, site type)
3. User enters component data (roof, facade, drainage, heating, ventilation, windows, gutters, wet rooms, chimney)
4. System computes risk score, flags, 5–10 year estimate, negotiation checklist
5. User sees free summary; can unlock full report for 99–149 SEK
6. Report auto-saves to local storage; user can add/edit house label

## Inputs

### Byggnadsdata (aligned with besiktning)

| Input                  | Type   | Required | Notes                                                                 |
| ---------------------- | ------ | -------- | --------------------------------------------------------------------- |
| House label            | string | No       | User-editable (e.g. address); for list view and saved reports         |
| Byggnadstyp            | enum   | Yes      | Suterränghus, enplanshus, flerplanshus, radhus, etc.                  |
| Byggnadsår             | number | Yes      | Build year                                                            |
| Size (m²)              | number | Yes      | Living area                                                           |
| Grundläggning          | enum   | Yes      | Källar/ytterväggar, betongplatta, torpargrund, etc.                   |
| Stomme                 | enum   | No       | Trä, lättbetong, tegel, etc.                                          |
| Site type              | enum   | No       | Berg / sand / lera (affects drainage lifespan)                        |
| Yttertak type          | enum   | Yes      | Betongpannor, tegeltak, plåttak, takpapp, gummiduk, etc.              |
| Yttertak age / renewal | number | Yes      | Years since new or last renewal                                       |
| Hängrännor/stuprör age | number | No       | Years; BILAGA 3: 25 yr lifespan; default from house year              |
| Fasad type             | enum   | Yes      | Tegel, trä, puts, blandad (e.g. tegel+trä+puts)                       |
| Fasad age / renewal    | number | Yes      | Years since new or last målning/omputsning                            |
| Fönster type           | enum   | No       | 2-glas, 3-glas, isolerglas; age matters                               |
| Fönster age / byte     | number | No       | Years since replacement; BILAGA 3: isolerglas 25 yr, byte 40 yr       |
| Dränering age          | number | No       | Years; BILAGA 3: 25 yr ledning, 50 yr dagvatten utanför               |
| Uppvärmning            | enum   | Yes      | Direktverkande el, luft/luft värmepump, bergvärme, fjärrvärme, etc.   |
| Ventilation            | enum   | Yes      | Självdrag, frånluft, FTX/mekanisk                                     |
| Luftvärmepump age      | number | No       | If applicable; BILAGA 3: 8 yr                                         |
| Våtrum age/renovation  | number | No       | Years since renovation; BILAGA 3: plastmatta 20 yr, tätskikt 15–30 yr |
| Skorsten               | bool   | No       | Has fireplace / wood stove                                            |
| Skorsten last seal     | number | No       | Years; BILAGA 3: 40 yr                                                |

## Positioning (Legal & Marketing)

**Sell:** “Actionable recommendations aligned with Swedish norms and health guidance.”  
**Not:** Official approval, BBR compliance claim, or authority affiliation.

**Safe phrasing:**

- “Recommendations informed by Swedish building regulations guidance (BBR) and public health guidance.”
- “Not a replacement for professional inspection.”
- “Not affiliated with Boverket/Folkhälsomyndigheten.”

**Avoid:** “BBR-compliant house”, “Official risk rating”, “Approved”.

---

## Monetization

- **One-time IAP only.** No ads. No subscription.
- Price: 99–149 SEK for full report unlock.

## Free vs Paid Packaging

### Free (fast value, conversion hook)

- Lifecycle flags (roof, wet rooms, drainage, heating, ventilation)
- 5–10 year cost exposure band (min / likely / max)
- Negotiation checklist (basic)

### Paid “Detailed Report” (99–149 SEK)

- **Swedish Norms Checklist** — Ventilation & air-quality risk flags with Boverket (BBR) guidance references
- **OVK status checklist** — “If applicable: ask for latest OVK protocol”; red flags if missing/failed
- **Health & Moisture Risk Guidance** — Condensation / mould indicators and recommended actions (Folkhälsomyndigheten-inspired)
- **Buyer Actions Plan (Before Bidding)** — Documents to request, questions for seller/agent, when to insist on deeper inspection
- **Reference-backed checks** — Each recommendation: “Why it matters”, “What to ask for”, “What bad looks like”, “Source: Boverket / Folkhälsomyndigheten” (link)
- **Exportable PDF** — Shareable with partner/bank (save to device, share via system share sheet)

---

## Authority Anchors (What We Reference — Not What We Are)

| Source                                      | Role               | How we use it                                                                                                                               |
| ------------------------------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| **BBR** (Boverkets byggregler)              | Principle anchor   | “Hygien, hälsa och miljö” — why ventilation/air quality matters; what good practice aims for. Not lifecycle/cost authority.                 |
| **OVK** (Obligatorisk ventilationskontroll) | Inspection reality | Boverket-mandated ventilation control. “If your building type is subject to OVK, ask for latest OVK protocol.” Red flags if missing/failed. |
| **Folkhälsomyndigheten**                    | Health guidance    | Ventilation + moisture/mould link; dampness health risks. “Health risk lens” + “what to do / what to ask” guidance.                         |

---

## Outputs

- **Risk score:** 0–100 or Low / Medium / High
- **Lifecycle flags:** Roof, drainage, facade, ventilation, heating, wet rooms
- **Explainability:** For each flag, show: (1) which inputs triggered it, (2) how much it contributed to the score. No black-box logic.
- **5–10 year cost estimate:** Min / likely / max SEK
- **Negotiation checklist:** Basic (free) or full Buyer Actions Plan (paid)

---

## Component Model — SBR BILAGA 3 (Tekniska medellivslängder)

Source: SBR Byggingenjörerna överlåtelsebesiktning, Meddelande M84:10, SABO-avskrivningsregler.

### Tak (Yttertak)

| Material / typ                | Livslängd | Kostnad (SEK)   | Notes                             |
| ----------------------------- | --------- | --------------- | --------------------------------- |
| Takpapp låglutande/platta     | 20        | 80 000–150 000  |                                   |
| Gummiduk låglutande/platta    | 30        | 100 000–200 000 |                                   |
| Takpapp under takpannor       | 30        | —               | Pannor separat                    |
| Takpannor betong/tegel        | 30        | 150 000–300 000 |                                   |
| Korrugerad plåt + papp        | 35        | 100 000–250 000 |                                   |
| Bandfalsad/falsad plåt + papp | 35        | 100 000–250 000 |                                   |
| Plåtdetaljer (skorsten, vent) | 35        | Varierar        |                                   |
| Hängrännor/stuprör            | 25        | 15 000–40 000   | Ofta byts tillsammans med tak     |
| Nytt undertak invändigt       | 40        | Inkl. tak       | \* före 1995: 20 yr; efter: 30 yr |

### Dränering / fuktskydd

| Komponent                              | Livslängd | Kostnad           | Notes                    |
| -------------------------------------- | --------- | ----------------- | ------------------------ |
| Dräneringsledning + vertikal fuktskydd | 25        | 3 000–4 000 kr/m  | Per meter                |
| Dagvattenledning utanför byggnad       | 50        | Inkl. i dränering |                          |
| Total villa (ca 100 m²)                | —         | 130 000–200 000   | Före ROT; berg/sand/lera |

### Fasad

| Material             | Livslängd | Underhåll           | Kostnad                       |
| -------------------- | --------- | ------------------- | ----------------------------- |
| Tegel                | Ej byte   | Minimal             | —                             |
| Träpanel (byte)      | 40        | Målning var 10:e år | 800 kr/m² målning; 1 700 ny   |
| Puts tjockputs       | 30        | Oputsning 30 yr     | 2 500 kr/m² ny puts           |
| Asbestcement/eternit | 30        | —                   | Professionell hantering krävs |

### Fönster / dörrar

| Komponent              | Livslängd | Notes                             |
| ---------------------- | --------- | --------------------------------- |
| Isolerglasfönster      | 25        | Blir otäta med tiden (punktering) |
| Byte fönster           | 40        |                                   |
| Byte dörrar            | 35        | Inne/ute                          |
| Målning fönster/dörrar | 10        | Repeteras                         |

### Våtutrymmen (bad, tvätt)

| Komponent                             | Livslängd | Notes                                                |
| ------------------------------------- | --------- | ---------------------------------------------------- |
| Plastmatta våtrum                     | 20        | Tätskikt under klinker                               |
| Tätskikt våtrum (typ tunn dispersion) | 15        | 1980/90-tal                                          |
| Typgodkänd våtrumsmatta (plast)       | 20–30     | \* före 1995: 20 yr; efter 1995: 30 yr               |
| Våtrumstapeter väggar                 | 15        |                                                      |
| Sanitetsgods (tvättställ, WC)         | 30        | Gjutjärnsbrunn: rust risk; bytas ofta vid renovering |

Riskanalys från besiktning: äldre plastbaserat tätskikt + klinker → alkalisk reaktion, nedbrytning. Gjutjärnsbrunn nära vägg → risk läckage.

### Suterräng / grund (1970-tal)

- **Motfyllda ytterväggar:** Fuktskydd ~20 yr genomsnittlig livslängd. Äldre → fuktvandring, mikrobiella skador.
- **Betongplatta 70-tal:** Ofta bristfällig underliggande isolering → kapillär fuktvandring, mögelrisk.
- **Träskyddsbehandlat virke:** Vanligt i 70-talshus; kan avge lukt i boendemiljön.

### Skorsten

| Åtgärd             | Intervall | Kostnad         |
| ------------------ | --------- | --------------- |
| Tätning rökkanaler | 40 yr     | ~1 400 kr/löp m |

### Installationer (ej full besiktning, men relevant för risk)

| Komponent          | Livslängd | Notes             |
| ------------------ | --------- | ----------------- |
| Luftvärmepump      | 8         | BILAGA 3          |
| Värmeväxlare       | 20        |                   |
| Varmvattenberedare | 20        |                   |
| Elinstallationer   | 45        | Kablar, centraler |

### Ventilation (BBR / OVK angle)

- **BBR:** Requirements around air/ventilation for indoor climate, radon, moisture, microorganisms (Boverket).
- **OVK** (Obligatorisk ventilationskontroll): Mandatory ventilation control (Boverket); certified inspector. If building type is subject to OVK → ask for latest OVK protocol; flag if missing/failed.
- **Folkhälsomyndigheten:** Ventilation + moisture/mould health risks; condensation/dampness indicators.
- **Types:** Självdrag (weak exchange; higher moisture risk); Frånluft; FTX/mekanisk (better; lower heating cost).

---

## Risk Score Logic

- **Per component:** If (age / lifespan) > 0.7 → flag as risk; if > 0.9 → high risk
- **Suterräng/betongplatta 70-tal:** Auto-flag if byggnadsår 1965–1985 + betongplatta
- **Våtrum:** Combine tätskikt age + plastmatta age; flag if "tekniska livslängden passerad"
- **5–10 year cost:** Sum of replacement costs for components flagged in that window
- **Overall score:** Weighted by cost impact and urgency; 0–100 or Low/Medium/High

## Negotiation Checklist (from besiktning + OVK)

- Fråga säljare: När byttes tak/fasad/dränering/fönster senast? Finns kvitton?
- Kräv köpargenomgång: För att juridiskt överta besiktningsutlåtande; inom 6 månader
- **OVK:** Om byggnadstyp omfattas av OVK — begär senaste OVK-protokoll; flagga om saknas/underkänd
- Betongplatta 70-tal: Undersök om isolering under plattan finns; överväg fortsatt teknisk utredning
- Våtrum: Äldre gjutjärnsbrunn? Tätskikt bytt vid renovering?
- Motfyllda väggar: Hur gammalt är fuktskyddet? Utreglade väggar?
- Yttertak: Snötäckt vid besiktning? Kontrollera när snön smält

---

## Marketing Angles

- **A. Don’t bid blind** — Free: scary headline (exposure + top 3 risks). Paid: playbook (what to do, what to demand, how to negotiate).
- **B. Health-risk aware buying** — Ventilation adequacy, moisture/mould signals, “what indicators mean” (Folkhälsomyndigheten-inspired).
- **C. Document-driven buyer** — OVK: “Ask for latest OVK protocol (if building type requires it). Flag if missing/failed.”

---

## v1 Scope

**v1 inputs (must have):** Byggnadstyp, Byggnadsår, Size (m²), Grundläggning, Yttertak type/age, Fasad type/age, Uppvärmning, Ventilation.

**v1 optional:** House label, Fönster age, Dränering age, Våtrum age, Skorsten.

**v1 non-goals:** OVK lookup, PDF export, in-app purchase (manual unlock acceptable). Focus on risk engine + basic UI + local storage.

---

## Non-Goals (MVP)

- Integration with Booli / Hemnet / property APIs
- User accounts or cloud sync
- Web app
- Ads
- Legal/structural advice (output is indicative, not professional)
