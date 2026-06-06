# 2026-06-07 Android Flow Review

Agent: [[../agents/lead-developer|Lead Developer]]

Test context:

- The app was opened successfully on an Android device using an SDK 56-compatible Expo Go build.
- Android is the current validation device, but the intended navigation and gesture behavior should remain consistent on iOS unless platform conventions require a difference.
- This session records observations only. No implementation decisions have been finalized.

## Observations

### Recording Home And History

- Keep the existing up-arrow action that opens History.
- Add a swipe-up gesture on the main recording page to open History.
- Add a swipe-down gesture on History to close it and return to the recording page.
- Preserve accessible tap controls alongside gestures; gestures must not be the only way to navigate.

### Main Recording Icon

- Replace the current main icon.
- Its current anticlockwise rotation is noted but not worth fixing independently because the icon will be changed.

### History Navigation

- Current behavior: open an item from History, then go back, and the app returns to the start-recording page.
- Desired behavior: Back should return to History because History was the previous screen/state in that flow.
- Navigation should preserve the user's actual entry point rather than always resetting to recording home.

### Completed History Items

- Current behavior: content inside a previously completed History item is editable.
- Desired behavior: completed History items should be read-only in this view.
- Editing or typing should not be available unless a separate explicit edit action is designed later.

### Recording And Backend Blocker

- Recording could not be tested further because the backend/mock path was not working.
- Do not assume this is intentional.
- Diagnose backend reachability, health, provider readiness, frontend API configuration, and error presentation before the next flow test.

Follow-up:

- Real transcription is now confirmed working on web.
- Transcription is still not working through Expo Go on the Android device.
- On inspection, the Python service, Node backend, and Expo server were all
  listening, and both backend health endpoints reported the local transcription
  provider ready.
- The next Expo Go failure should be captured with the exact in-app error and
  backend terminal output because service readiness alone does not explain the
  device upload failure.

### Output Quality

- The output shown after a real transcript was generic because generation was
  still returning fixed golden/mock fixtures.
- Immediate desired behavior: the output must reflect the actual transcript,
  even before a real LLM provider is configured.
- A transcript-grounded local formatter is acceptable as an interim step if it
  is labeled honestly and does not pretend to be AI-polished generation.
- Real structured AI generation remains a separate provider integration.

### Output-Type Confirmation

- Current observed behavior skipped directly from successful transcription to
  generation/output.
- This removed the previously designed confirmation page.
- Desired behavior: after transcription, show the inferred output category and
  transcript preview before generation.
- Keep a prominent bottom `Change Type` action on that confirmation page.
- The top-right change-type control on the final output page is not sufficient
  as the primary way to correct the inferred category.
- A swipe-up type selector may be explored later, but it should complement an
  accessible visible button rather than replace it.

### Output Title Layout

- Current behavior: a long generated output title can extend beyond the screen
  bounds on the output page.
- Desired behavior: the title must remain fully visible within the viewport.
- Follow established frontend responsive-text rules: prefer natural wrapping
  to the next line, allow sufficient vertical space, and use a bounded
  responsive font-size adjustment only when wrapping still produces a poor
  layout.
- Do not truncate meaningful output titles unless the product intentionally
  offers a separate full-title view.
- Verify long titles on narrow Android and iPhone viewport sizes.

### Recording Transition

- Current transition from the start-recording state to active recording feels choppy.
- A short-lived intermediate page/state flashes for less than a second.
- Desired behavior: transition directly and smoothly from idle to recording without a visually separate transient page.
- Candidate direction for later discussion: animate the existing orb between idle and recording forms while keeping it spatially stable.
- Final orb animation and replacement icon should be designed together rather than patched separately.

## Discussion Backlog

1. History swipe thresholds, gesture conflicts, and animation behavior.
2. Back-navigation/state-preservation model for History and other overlays.
3. Read-only history detail versus a future explicit edit mode.
4. Replacement recording icon and orb state animation.
5. Root cause of backend/recording failure on the Android device.
6. Smooth idle-to-recording transition and removal of the transient intermediate state.
7. Whether output-type selection should also support a swipe-up gesture.
8. Responsive wrapping and sizing rules for long output titles.

## Current Priority

Before evaluating transcription and output quality, restore the device-to-backend recording path. Then repeat the full flow test and discuss the UX observations together before implementation.
