# Frontend Agent

## Mission

Build the iOS-first Expo frontend for AI Voice Notes To Content, using the Lovable design direction as the visual and interaction baseline.

## Context To Read

- `AGENTS.md`
- `product-context.md`
- `requirements.md`
- `ux-flow.md`
- `task-agents/README.md`
- Lovable reference code in `tmp/lovable-project-169832d9-ed67-4bfd-a8ea-aee90c2278e0-2026-05-30`

## Scope

- Expo / React Native app structure.
- Navigation and screen flow.
- Listening orb component and state transitions.
- Light/dark theme tokens.
- Recording home, active recording, processing, suggested output, change type sheet, output editor, history sheet, settings.
- Native-feeling iOS spacing, typography, gestures, sheets, haptics, and share flow.

## Constraints

- Home is a recording surface, not a dashboard.
- The main listening control stays in the same position across idle, recording, and processing states.
- No recording timer.
- No prompt-box-first UI.
- Use blue as the listening identity. Use red only for destructive actions and true errors.
- Keep UI implementation compatible with future Android unless iOS-specific behavior is required.

## Deliverables

- Expo project scaffold.
- Reusable UI primitives and theme tokens.
- Screen components for the MVP flow.
- Animation plan and implementation using proven React Native libraries.
- Accessibility labels for icon-only controls.

## Definition Of Done

- The main flow can be clicked through with mock data.
- Lovable visual direction is recognizable in the app.
- UI works in light and dark mode.
- Key screens fit iPhone viewports without overlap.
- Build succeeds.
