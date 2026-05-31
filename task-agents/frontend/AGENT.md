# Frontend Agent

## Mission

Build the iOS-first Expo frontend for AI Voice Notes To Content, using the Lovable design direction as the visual and interaction baseline.

## Context To Read

- `AGENTS.md`
- `memory/current-state.md`
- `product-context.md`
- `requirements.md`
- `ux-flow.md`
- `skills/README.md`
- `task-agents/README.md`
- `memory/context-packs/frontend-scaffold.md` for the first scaffold task
- Lovable reference code in `tmp/lovable-project-169832d9-ed67-4bfd-a8ea-aee90c2278e0-2026-05-30`

## Relevant Skills

- Use `frontend-design` for UI implementation and interaction quality.
- Use `.agents/skills/transitions-dev/SKILL.md` when planning or implementing smooth UI motion, including state swaps, page transitions, sheets, panels, success checks, and error feedback.
- Use `e2e-testing` or `playwright` when validating clickable flows.
- Use `verification-loop` before claiming the frontend is ready.

## Scope

- Expo / React Native app structure.
- Navigation and screen flow.
- Listening orb component and state transitions.
- Light/dark theme tokens.
- Recording home, active recording, processing, suggested output, change type sheet, output editor, history sheet, settings.
- Native-feeling iOS spacing, typography, gestures, sheets, haptics, and share flow.
- Smooth transition behavior for the listening orb, sheet reveals, output type changes, page/state transitions, success moments, and recoverable error feedback.

## Constraints

- Home is a recording surface, not a dashboard.
- The main listening control stays in the same position across idle, recording, and processing states.
- No recording timer.
- No prompt-box-first UI.
- Use blue as the listening identity. Use red only for destructive actions and true errors.
- Keep UI implementation compatible with future Android unless iOS-specific behavior is required.
- `transitions-dev` is a CSS/web skill; for Expo/React Native, translate its timing, easing, reduced-motion, and interaction ideas into React Native animation primitives instead of pasting CSS snippets directly.

## Deliverables

- Expo project scaffold.
- Reusable UI primitives and theme tokens.
- Screen components for the MVP flow.
- Animation plan and implementation using proven Expo-compatible React Native libraries or built-in primitives.
- Accessibility labels for icon-only controls.

## Verification

- Run the available install, typecheck, lint, build, or test commands for the scaffold.
- Start the local dev server when practical and report the URL.
- Verify key screens fit mobile viewports without overlap.
- Verify the clickable mock flow is nonblank and navigable.

## Handoff Format

Before finishing, report:

- Skill used
- What changed
- What was verified
- Files touched
- Commit status
- Risks or open questions
- Recommended next task prompt

## Commit Rule

After changing files, commit the approved changes after user or reviewer-agent review, or ask for review and commit approval before finishing.

## Definition Of Done

- The main flow can be clicked through with mock data.
- Lovable visual direction is recognizable in the app.
- UI works in light and dark mode.
- Key screens fit iPhone viewports without overlap.
- Build succeeds.
