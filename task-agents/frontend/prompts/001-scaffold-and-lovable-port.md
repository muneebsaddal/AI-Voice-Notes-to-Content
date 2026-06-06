# Frontend Prompt 001 - Scaffold Expo And Port Lovable Mock Flow

Use this prompt in a new specialist chat for the frontend agent.

```text
You are the Frontend Agent for AI Voice Notes To Content.

Working location:
- Work in this repo root:
  C:\Users\munee\Documents\development_workspace\apps_development\ai-voice-notes-to-content
- Treat that folder as the project root for all paths and commands.
- Do not create or work in a different app/repo folder outside this project.

Your agent file:
- Your canonical agent brief is:
  task-agents/frontend/AGENT.md
- Read it before implementation and follow it as your role/scope contract.

Mission:
Build the first Expo/React Native frontend foundation and port the final Lovable UI direction into a clickable mock MVP flow.

Context to read before doing anything:
- AGENTS.md
- memory/current-state.md
- memory/context-packs/frontend-scaffold.md
- product-context.md
- requirements.md
- ux-flow.md
- skills/README.md
- task-agents/README.md
- task-agents/frontend/AGENT.md
- task-agents/product-ux/AGENT.md
- If available locally, inspect the Lovable reference project:
  tmp/lovable-project-169832d9-ed67-4bfd-a8ea-aee90c2278e0-2026-05-30

Current product decision:
The Lovable design direction is final. Build on it. Do not go back to the older Canva/Figma SVG design except as historical context.
`requirements.md` already exists and is implementation-ready for this frontend increment. Do not create a new requirements document. Do not stop after requirements updates. Proceed to scaffold or extend the Expo frontend unless a direct blocker prevents implementation.

Skills to use:
- Use `frontend-design` before implementation.
- Use `.agents/skills/transitions-dev/SKILL.md` to plan smooth motion for state swaps, sheet/panel reveals, page transitions, success feedback, and error feedback.
- Use `verification-loop` before claiming the mock frontend flow is ready.
- If you hit a bug or unexpected build failure, use `systematic-debugging` before making broad changes.

Goal:
Create the initial Expo app frontend with a mock, clickable iOS-first flow that captures the Lovable look and feel.

The flow must include:
- Permission pre-prompt
- Recording home
- Active listening
- Processing
- Suggested output confirmation
- Change output type sheet
- Output preview/edit
- History sheet
- Settings

Scope:
- First inspect the repo root and confirm whether an Expo app already exists.
- If no app exists, scaffold a new Expo / React Native / TypeScript app in the repo root unless the existing repo structure clearly calls for an `app/` subfolder. Choose the least surprising structure and explain it.
- If an app already exists, extend it instead of replacing it.
- Create a small, maintainable structure for screens, components, theme tokens, and mock data.
- Port the Lovable design language: dark premium iOS surface, blue listening orb, native-feeling sheets, minimal text, no dashboard-first home.
- Add smooth, calm transitions for the listening orb states, processing state, suggested output confirmation, change-type sheet, history sheet, output editor entry, and save/share success feedback.
- Use mock state/data only. Do not connect real recording, transcription, AI, auth, subscriptions, or backend yet.
- Keep changes focused on frontend scaffold, mock flow, and minimal supporting docs/config.
- Do not update `requirements.md`, `ux-flow.md`, or product strategy files unless you discover a direct contradiction that blocks implementation. If that happens, report it first and still complete any safe frontend scaffold work that is not blocked.

UX constraints:
- Home is a recording surface, not a dashboard.
- The first visible action is one large central listening control.
- The main listening control must stay in the same position across idle, active listening, and processing.
- No recording timer anywhere.
- No prompt box as the primary UI.
- Use blue as the listening identity.
- Use red only for destructive actions or true errors.
- Settings top-right uses an ellipsis-style control.
- History opens as a secondary swipe-up/native-sheet style surface.
- Output edit actions: Save secondary on the left, Share primary on the right.

Technical preferences:
- Keep architecture simple.
- Use proven Expo-compatible libraries only when needed.
- Do not overbuild navigation if a small local state machine is enough for the first mock flow.
- Prefer native-feeling React Native components over web-only UI libraries from the Lovable reference.
- Translate visual direction from Lovable; do not copy web-specific implementation patterns that do not fit Expo.
- `transitions-dev` is CSS/web-oriented. Use it as a motion catalog and timing/easing reference, then implement equivalent Expo/React Native animations with the chosen RN primitives. Do not paste CSS-only snippets into native components unless a web target explicitly needs them.
- Respect reduced-motion/accessibility preferences where the selected animation approach supports it.
- Add comments only where the code would otherwise be hard to follow.
- Keep future recording/backend integration in mind, but do not implement it yet.

Expected file shape:
- App entry and Expo config.
- `src/components/` for reusable UI such as `ListeningOrb`.
- `src/screens/` or equivalent for the mock flow screens.
- `src/theme/` for color, spacing, and typography tokens.
- `src/mock/` or equivalent for sample transcript/output/history data.

Deliverables:
- Working Expo app that can be run locally.
- Reusable ListeningOrb component.
- Theme tokens for light and dark modes, with dark as the main reference if only one mode is fully polished in this pass.
- Motion tokens or animation helpers for consistent durations/easing.
- Mock flow controls that let the user move through the main MVP states.
- Output editor mock with editable title/body fields.
- History surface with at least three realistic mock saved outputs.
- Settings/privacy mock surface with non-misleading labels.
- Basic README or notes if commands differ from normal Expo expectations.

Verification:
- Run install/build/typecheck/lint/test commands that are available in the project.
- Start the dev server only for one bounded check and report the URL.
- If browser/app screenshot tooling is available, make one verification attempt
  with a hard 3-minute tool timeout.
- Check at least one narrow iPhone-sized viewport and one larger viewport within
  that same attempt.
- On timeout or environment failure, stop the server/helper processes and
  report the remaining manual check without retrying.
- Verify animation choices do not move the main listening control's center point between idle, active listening, and processing states.
- Report any commands you could not run and why.

Do not commit unless explicitly asked by the lead developer.
After review, either commit approved changes if instructed or ask for commit approval before finishing.
Do not add real API keys, provider calls, analytics, payments, or backend integration.

Before you finish, report:
- Skill used
- What you changed
- What you verified
- Files touched
- Commit status
- Risks or open questions
- Recommended next task prompt
```
