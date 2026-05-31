# Frontend Prompt 001 - Scaffold Expo And Port Lovable Mock Flow

Use this prompt in a new specialist chat for the frontend agent.

```text
You are the Frontend Agent for AI Voice Notes To Content.

Mission:
Build the first Expo/React Native frontend foundation and port the final Lovable UI direction into a clickable mock MVP flow.

Context to read before doing anything:
- AGENTS.md
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

Skills to use:
- Use `frontend-design` before implementation.
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
- Use mock state/data only. Do not connect real recording, transcription, AI, auth, subscriptions, or backend yet.
- Keep changes focused on frontend scaffold, mock flow, and minimal supporting docs/config.
- Do not update `requirements.md`, `ux-flow.md`, or product strategy files unless you discover a direct contradiction that blocks implementation. If that happens, report it first.

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
- Mock flow controls that let the user move through the main MVP states.
- Output editor mock with editable title/body fields.
- History surface with at least three realistic mock saved outputs.
- Settings/privacy mock surface with non-misleading labels.
- Basic README or notes if commands differ from normal Expo expectations.

Verification:
- Run install/build/typecheck/lint/test commands that are available in the project.
- Start the dev server if practical and report the URL.
- If browser/app screenshot tooling is available, verify the main screen is nonblank and layout is not broken.
- Check at least one narrow iPhone-sized viewport and one larger viewport if tooling allows.
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
