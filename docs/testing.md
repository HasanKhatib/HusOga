# How to Test

**Constitution principle:** Test after each implementation phase. Do not proceed to the next phase until the current phase's checkpoint passes.

---

## Commands

```bash
# Run all unit and integration tests
flutter test

# Run app on default device (simulator/emulator or connected device)
flutter run

# Run on specific device
flutter devices
flutter run -d <device_id>

# Run tests in watch mode (re-run on file change)
flutter test --watch
```

---

## Phase-by-Phase Checkpoints

### After Phase 1 (Setup)

- [ ] `flutter pub get` succeeds
- [ ] `flutter analyze` passes (or has no critical issues)
- [ ] `flutter test` runs (may pass with zero tests)
- [ ] `flutter run` launches app (blank or placeholder screen is fine)

### After Phase 2 (Foundational)

- [ ] `flutter test` passes (risk engine + validation tests)
- [ ] `flutter run` launches app; no runtime errors on startup

### After Phase 3 (User Story 1 — MVP)

- [ ] `flutter test` passes
- [ ] Manual: Open app → create new report → enter required inputs → tap Calculate
- [ ] Manual: Verify risk score, lifecycle flags, cost band, and negotiation checklist appear
- [ ] Manual: Verify explainability (each flag shows triggering inputs and contribution)

### After Phase 4 (User Story 2)

- [ ] `flutter test` passes
- [ ] Manual: Create report → exit app (kill) → reopen
- [ ] Manual: Report appears in list; tap to open; data intact

### After Phase 5 (User Story 3)

- [ ] `flutter test` passes
- [ ] Manual: Open saved report → change roof age 15→25 → Calculate
- [ ] Manual: Risk output updates within 1s; back to list shows updated report

### After Phase 6 (User Story 4)

- [ ] `flutter test` passes
- [ ] Manual: Delete report → confirm → report gone from list
- [ ] Manual: Empty list shows appropriate empty state

### After Phase 7 (User Story 5)

- [ ] `flutter test` passes
- [ ] Manual: Settings → switch language → verify UI updates
- [ ] Manual: Restart app → language persists

### After Phase 8 (Polish)

- [ ] `flutter test` passes (including integration test)
- [ ] Manual: Full flow in English and Swedish
- [ ] Manual: Report limit behavior (free user at 1 report)

---

## Device / Simulator Setup

**iOS (macOS only):**

```bash
open -a Simulator
flutter run -d ios
```

**Android:**

```bash
# Start emulator from Android Studio, or:
flutter emulators
flutter emulators --launch <emulator_id>
flutter run -d android

# Run on physical device (wireless ADB example):
flutter run -d "adb-R5CXA2VQR4Z-nABGEh._adb-tls-connect._tcp"
```

**Check available devices:**

```bash
flutter devices
flutter doctor
```

---

## Test Focus

- **Unit tests:** Risk engine logic, input validation (per constitution)
- **Integration test:** Report flow (create → save → list → open)
- **Manual checks:** UI flows, localization, edge cases
