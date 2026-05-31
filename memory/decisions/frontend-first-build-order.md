# Frontend-First Build Order

Status: accepted

The next build step is frontend-first.

Order:

1. Scaffold Expo and shared project structure.
2. Port the Lovable UI direction into React Native components.
3. Build a clickable mock flow with local state and mock data.
4. Add recording lifecycle interfaces and mock audio states.
5. Add backend API skeleton with mock transcription and generation.
6. Connect frontend to mocked API.
7. Integrate real provider calls only when keys and environment are ready.

Rationale:

- The biggest MVP risk is product feel and flow quality.
- Mock UI lets the team test the one-tap capture and output-preview loop before backend complexity.

Related:

- [[lovable-design-final|Lovable Design Final]]
- [[../agents/frontend|Frontend Agent]]
