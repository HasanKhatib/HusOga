# Screenshot Specs & Content Plan

## Required Slots

### iOS (App Store Connect)

| Slot | Device | Resolution | Required? |
|------|--------|------------|-----------|
| 6.9" iPhone | iPhone 16 Pro Max | 1320 × 2868 px | Yes (primary) |
| 6.5" iPhone | iPhone 14 Plus / 13 Pro Max | 1284 × 2778 px | Yes (fallback) |
| 5.5" iPhone | iPhone 8 Plus | 1242 × 2208 px | Optional |
| 12.9" iPad | iPad Pro 6th gen | 2048 × 2732 px | Recommended |

> You can supply only 6.9" and App Store Connect will use them for all iPhone slots, but 6.5" is used as a fallback for older devices — supply both to be safe.

**Maximum per slot:** 10 screenshots. **Recommended:** 5.

### Android (Google Play Console)

| Slot | Spec | Required? |
|------|------|-----------|
| Phone | 16:9 or 9:16, min 320px, max 3840px per side | Yes (min 2, max 8) |
| 7" tablet | Same spec | Optional |
| 10" tablet | Same spec | Optional |

Common phone size to target: **1080 × 1920 px** (portrait).

---

## Content Plan — 5 Screenshots

Use the same 5 frames across all slots (resize/export per resolution). Portrait orientation.

### Screenshot 1 — Hook / Value proposition
**Headline:** "Se husets skick på ett ögonblick"
**Sub:** "Trafiklys-konditionsöversikt direkt på visningen"
**App content:** Result screen showing a mix of green/amber/red rows (realistic house, circa 1975)

### Screenshot 2 — Condition overview
**Headline:** "Sex nyckelkomponenter på en skärm"
**Sub:** "Tak · Dränering · Våtrum · VVS · Uppvärmning · Ventilation"
**App content:** Full konditionsöversikt card list, all 6 rows visible

### Screenshot 3 — Viewing tips (free feature)
**Headline:** "Visningstips anpassade till resultaten"
**Sub:** "Vet vad du ska titta extra på"
**App content:** Visningstips section expanded with 2–3 tips visible

### Screenshot 4 — Pro: Cost forecast + decision points
**Headline:** "Vad kostar det att åtgärda?"
**Sub:** "Kostnadsprognos och underhållspunkter ingår i Pro"
**App content:** Cost forecast section + 1–2 decision points, Pro badge visible

### Screenshot 5 — PDF export
**Headline:** "Dela rapporten med mäklare eller partner"
**Sub:** "Exportera som PDF med ett tryck"
**App content:** Share sheet open on result screen, or PDF preview

---

## Production Checklist

- [ ] Capture or mockup each frame at 6.9" resolution (1320 × 2868 px)
- [ ] Add headline overlay text (bold, white or dark, bottom 20% of frame)
- [ ] Add device frame (optional — Apple and Google both allow frameless)
- [ ] Export at 6.9" → scale down to 6.5" (1284 × 2778) for iOS fallback
- [ ] Export at 1080 × 1920 for Android phone slot
- [ ] Verify no screenshots contain personal data or real addresses

## Tools

- **Canva** — free device frame templates, easy text overlay
- **Figma** — more control, community templates for iPhone 15 Pro Max frames
- **Screenshot directly on device** — most authentic, but requires a physical device or simulator at correct resolution

## Simulator tip (Xcode)

```bash
# Boot iPhone 16 Pro Max simulator
xcrun simctl boot "iPhone 16 Pro Max"
# Open Simulator.app, run the app, use Cmd+S to take screenshot
# Screenshots save to Desktop at correct resolution
```
