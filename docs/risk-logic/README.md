You don’t need “one paper.” You need a **stack of 3–4 complementary models**, each covering a part of your score. That’s how real systems are built.

Below is the **minimal, defensible academic stack** for your risk score.

---

# 1. Core backbone: Building Condition Index (BCI)

**Paper to anchor:**

* [Comprehensive review of Building Condition Assessment models](https://www.sciencedirect.com/science/article/pii/S2590123024004304?utm_source=chatgpt.com)

**What it gives you:**

* Buildings are evaluated **by aggregating component conditions**
* Use **weights per component**
* Output = **single condition index**

**Key concept you should explicitly use:**

* “Building Condition Index (BCI) derived from component-level assessment” ([ScienceDirect][1])

**How you convert it into HusÖga:**

```
Risk Score = Σ (component_condition × weight)
```

Example:

* roof × 0.2
* wet rooms × 0.2
* drainage × 0.15
* foundation × 0.15
* ventilation × 0.1
* heating × 0.1
* facade/windows × 0.1

**Why this matters**
→ This alone makes your score academically defensible.

---

# 2. Deterioration model (THIS is your missing piece)

**Paper / concept:**

* [Deterioration modeling overview](https://en.wikipedia.org/wiki/Deterioration_modeling?utm_source=chatgpt.com)
* plus lifecycle studies (non-linear degradation)

**What it gives you:**

* Buildings **do not degrade linearly**
* Condition → tied to **probability of failure or threshold crossing** ([Wikipedia][2])

**Upgrade your current model**

Instead of:

* > 70% = risk
* > 90% = high risk

Use:

```
condition = f(age / lifespan)

Example (non-linear):
0–0.5 → low risk
0.5–0.7 → moderate
0.7–0.9 → accelerating risk
0.9–1.1 → high risk
>1.1 → failure-prone
```

**Why**
→ This aligns directly with deterioration theory used in infrastructure.

---

# 3. Defect-based risk (what actually drives failures)

**Paper:**

* [Defect-based building condition assessment](https://ira.lib.polyu.edu.hk/bitstream/10397/97502/1/Faqih_Defect-Based_Building_Condition.pdf?utm_source=chatgpt.com)

**What it gives you:**

* Risk is not just age → **defects accelerate deterioration**
* Moisture, cracks, installation failures = key drivers ([PolyU Institutional Research Archive][3])

**Translate into your model:**

Add **risk multipliers**:

```
if crawlspace → + moisture risk
if slab (1965–85) → + drainage risk
if wet room > 25y → + major risk
if poor ventilation → + moisture multiplier
```

**Why**
→ This justifies your “special rules” scientifically.

---

# 4. Maintenance + cost coupling (critical for your app)

**Paper:**

* [Framework for building condition and maintenance decisions](https://www.mdpi.com/2075-5309/15/9/1511?utm_source=chatgpt.com)

**What it gives you:**

* Condition assessment is used to:

  * **predict maintenance**
  * **prioritize repairs**
  * **estimate cost exposure** ([MDPI][4])

**Translate into HusÖga:**

```
Cost Exposure = Σ (probability_of_failure × replacement_cost)
```

Or simpler:

* components near end-of-life → mapped to SEK
* aggregate into 5-year exposure

**Why**
→ This legitimizes your “cost exposure” feature academically.

---

# Final model (clean, defensible)

Combine all 4 layers:

### Step 1 — Component condition (BCI logic)

```
Ci = f(age / lifespan)
```

### Step 2 — Apply defect multipliers

```
Ci_adjusted = Ci × risk_modifiers
```

### Step 3 — Weighted aggregation

```
Risk Score = Σ (Ci_adjusted × Wi)
```

### Step 4 — Map to decision bands

```
0–30 → Low
30–60 → Medium
60–80 → High
80+ → Critical
```

---

# What you can CLAIM (safely)

Use this wording:

* “Based on component-level building condition assessment models”
* “Incorporates deterioration modelling used in infrastructure and asset management”
* “Adjusted using defect-based risk factors identified in building pathology research”
* “Aligned with maintenance and lifecycle cost modelling used in facility management”

---

# What NOT to claim

Avoid:

* “scientifically proven score”
* “validated model” (unless you actually validate it)
* “based on [specific university]”

---

# Critical improvement (you should implement)

Right now your model is:

* threshold-based
* discrete
* heuristic

To level it up:

1. Replace thresholds with **continuous deterioration curve**
2. Add **component weights explicitly**
3. Separate:

   * condition
   * failure risk
   * cost exposure

---

# Bottom line

If you anchor HusÖga on:

1. BCI (component aggregation)
2. Deterioration curves (non-linear aging)
3. Defect multipliers (moisture, construction types)
4. Cost-based maintenance logic

→ you are no longer “guessing”

→ you are implementing a simplified version of **real asset management models**

That is enough to claim **research-grounded methodology** without overreaching.

---

If you want next step: I can turn this into a **clean formula spec for your Dart engine** (drop-in upgrade).

[1]: https://www.sciencedirect.com/science/article/pii/S2590123024004304?utm_source=chatgpt.com "Comprehensive review and comparative analysis of ..."
[2]: https://en.wikipedia.org/wiki/Deterioration_modeling?utm_source=chatgpt.com "Deterioration modeling"
[3]: https://ira.lib.polyu.edu.hk/bitstream/10397/97502/1/Faqih_Defect-Based_Building_Condition.pdf?utm_source=chatgpt.com "Defect-based building condition assessment"
[4]: https://www.mdpi.com/2075-5309/15/9/1511?utm_source=chatgpt.com "Developing a Framework for Building Condition ..."
