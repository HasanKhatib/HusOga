# Screenshots — Step-by-Step Guide

5 frames, same content for iOS and Android, resized per platform.

---

## Required Sizes

| Platform | Size | Slots |
|---|---|---|
| iOS primary | 1320 × 2868 px (6.9" iPhone 16 Pro Max) | Required |
| iOS fallback | 1284 × 2778 px (6.5" iPhone 14 Plus) | Required for older devices |
| Android phone | 1080 × 1920 px | Required (min 2, max 8) |

Upload location:
- **iOS:** App Store Connect → HusÖga → App Store → Screenshots
- **Android:** Play Console → HusÖga → Store listing → Graphics → Phone screenshots

---

## Step 1 — Run the app in the iOS Simulator

```bash
# Boot iPhone 16 Pro Max simulator (matches 6.9" slot exactly)
xcrun simctl boot "iPhone 16 Pro Max"

# Start the app
npm run ios
```

In Simulator.app:
- Use **Cmd+S** to save a screenshot (saves to Desktop at correct resolution)
- Use **File → New Simulator** to add the 6.5" device if needed

---

## Step 2 — Capture each frame

Put the app in exactly this state before taking each screenshot:

### Frame 1 — Hook
**State:** Result screen, circa 1975 house with realistic mix of green/amber/red
```
Byggnadsår: 1975
Tak: 1998  (≈28 years → amber)
Dränering: 1980  (≈46 years → red)
Våtrum: 2005  (≈21 years → green)
VVS: 1990  (≈36 years → amber)
Uppvärmning: 2010  (≈16 years → green)
Ventilation: sjalvdrag (self-draft → red flag)
```
**Headline overlay:** "Se husets skick på ett ögonblick"
**Sub:** "Trafiklys-konditionsöversikt direkt på visningen"

### Frame 2 — Condition overview
**State:** Result screen, scroll to show all 6 component rows
**Headline overlay:** "Sex nyckelkomponenter på en skärm"
**Sub:** "Tak · Dränering · Våtrum · VVS · Uppvärmning · Ventilation"

### Frame 3 — Viewing tips (free)
**State:** Result screen, Visningstips section expanded with 2–3 tips visible
**Headline overlay:** "Visningstips anpassade till resultaten"
**Sub:** "Vet vad du ska titta extra på"

### Frame 4 — Pro: Cost forecast
**State:** Result screen scrolled to cost forecast section (Pro, visible if dev unlock is on)
Enable dev unlock: Settings → tap version number 5 times
**Headline overlay:** "Vad kostar det att åtgärda?"
**Sub:** "Kostnadsprognos och underhållspunkter ingår i Pro"

### Frame 5 — PDF export
**State:** Share sheet open on result screen (tap share/export button)
**Headline overlay:** "Dela rapporten med mäklare eller partner"
**Sub:** "Exportera som PDF med ett tryck"

---

## Step 3 — Add headline overlays

Use **Canva** (free) or **Figma**:

1. Create a canvas at 1320 × 2868 px
2. Place the screenshot as the background
3. Add a semi-transparent dark bar across the bottom ~20% of the frame
4. Headline: bold white, ~80–90px, centred
5. Sub: regular white, ~50px, centred below headline
6. Export as PNG

Duplicate the canvas, swap the screenshot, repeat for each frame.

---

## Step 4 — Resize for other slots

From the 1320 × 2868 master:
- **iOS 6.5":** scale down to 1284 × 2778 (Canva: resize canvas, reposition elements)
- **Android:** crop/resize to 1080 × 1920 (remove some top/bottom margin)

---

## Step 5 — Upload

**App Store Connect:**
1. Go to `https://appstoreconnect.apple.com/apps/6761786637`
2. App Store → iPhone screenshots
3. Upload 6.9" set first (drag all 5), then 6.5" set

**Play Console:**
1. Go to Play Console → HusÖga → Store listing
2. Scroll to Graphics → Phone screenshots
3. Upload the 1080×1920 set (min 2 required, upload all 5)

---

## Checklist

- [ ] Frame 1: Hook — result screen with mixed traffic lights
- [ ] Frame 2: Condition overview — all 6 rows visible
- [ ] Frame 3: Viewing tips — 2–3 tips expanded
- [ ] Frame 4: Cost forecast — Pro section visible (dev unlock on)
- [ ] Frame 5: PDF export — share sheet open
- [ ] Headline overlays added to all 5 frames
- [ ] Exported at 1320 × 2868 (iOS primary)
- [ ] Exported at 1284 × 2778 (iOS fallback)
- [ ] Exported at 1080 × 1920 (Android)
- [ ] No screenshots contain personal data or real addresses
- [ ] Uploaded to App Store Connect (iOS slots)
- [ ] Uploaded to Play Console (Android slot)
