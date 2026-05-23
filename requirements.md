# AI Voice Notes To Content Requirements

Last updated: 2026-05-23
Owner: Lead Developer Agent
Status: Draft v0.1

## 1. Purpose Of This Document

This file is the living product and technical requirements source for AI Voice Notes To Content. It must be updated whenever product decisions, MVP scope, integrations, pricing, deadlines, architecture, privacy rules, or launch requirements change.

No app code should be written until this file is clear enough to guide the first MVP.

## 2. Product Vision

AI Voice Notes To Content is an iOS-first app that turns messy spoken thoughts into useful structured outputs.

Core promise:

**Say it once. Use it everywhere.**

The app is not only a transcription tool. It should let users speak naturally, infer what they meant, transform the recording into the right output, and make that output easy to edit, save, copy, share, or export.

The ideal experience:

1. Open app.
2. Tap record.
3. Speak naturally.
4. Pick or confirm output type.
5. Receive a polished result.
6. Edit if needed.
7. Send it where it belongs.

The product succeeds when a user can turn a natural spoken thought into a useful output within about 30 seconds.

## 3. Target Users

Primary users:

- Busy founders who need meeting notes, follow-ups, decisions, and product ideas.
- Freelancers and consultants who need client emails, task lists, updates, and reminders.
- Creators who capture content ideas while walking, commuting, or working.
- Students who want study notes, summaries, revision tasks, and lecture reflections.
- Knowledge workers who think aloud and need fast structured capture.
- Journal users who prefer speaking over typing.
- Personal productivity users who want ideas and tasks to stop disappearing.

Early adopter niches:

- Instagram, LinkedIn, YouTube, and newsletter creators.
- Solo founders and startup operators.
- Freelancers managing many client details.
- Students and self-learners.
- Productivity enthusiasts who already use Notion, Reminders, Calendar, or task apps.

## 4. Main User Problems

- Voice memos are easy to record but hard to process later.
- Raw transcripts are not enough; users need clean notes, tasks, emails, and content.
- Notes apps often store thoughts without turning them into action.
- Todo apps require manual task formatting.
- Journal apps still create blank-page friction.
- Email drafting is slow even when the user already knows what to say.
- Creators lose ideas before they become drafts.
- Meeting decisions and follow-ups get forgotten.
- Users think of important things while walking, driving, commuting, or working, but cannot easily organize them in the moment.

## 5. Product Principles

- Recording should be one tap from the main screen.
- The app should feel mobile-native, fast, calm, and obvious.
- The user should not need to write prompts.
- Output labels should use plain language.
- Useful defaults should reduce decision-making.
- Editing should be lightweight and always available before export.
- Export and share actions should be obvious.
- AI behavior should feel practical, not magical or unpredictable.
- Privacy should be treated as a core product feature.
- The MVP should be focused and polished before adding deep integrations.

## 6. MVP Scope

Version 1 must include:

- iOS-first app experience.
- Voice recording.
- Audio playback before or after transcription.
- Cloud speech-to-text transcription through a backend-mediated provider call.
- Cloud AI cleanup and transformation through a backend-mediated provider call.
- Five output modes:
  - Note
  - Todo List
  - Email
  - Journal Entry
  - Content Post
- Hybrid output selection: infer the best output type from the transcript, then let the user generate or change type.
- Output preview and edit screen.
- Local save history.
- Copy output.
- Native iOS share sheet export.
- Basic Notion export path using the native iOS Share Sheet.
- Delete local audio after successful transcription by default.
- Clear loading, success, empty, permission, and error states.
- Delete note/history item.
- Basic onboarding and privacy explanation.
- Subscription-ready structure, even if payments are not enabled in the first prototype.
- TestFlight-ready build path.

Version 1 should avoid:

- Complex multi-app automations.
- Full Notion database mapping.
- Gmail draft creation.
- Deep task-manager integrations.
- Team features.
- Web dashboard.
- Multi-language support beyond what transcription provider supports by default.
- Background recording complexity unless required for basic usability.

## 7. Non-MVP Features

Version 1.5:

- More advanced auto-detection using learned user preferences and templates.
- Local/privacy mode research spike for Apple Speech, Apple Foundation Models, and/or embedded local LLM runtimes.
- Tone selector.
- Templates by use case.
- Apple Reminders export.
- Calendar/reminder extraction with confirmation.
- Journal-specific template.
- Better Notion mapping.
- Simple tags and search in history.
- More output modes such as meeting summary, client follow-up, study note, and project idea.

Version 2:

- Optional total privacy mode if local transcription and local generation meet quality, speed, battery, and device-coverage requirements.
- Full Notion database mapping.
- Gmail draft creation.
- Todoist, Things, and TickTick export.
- Day One or Apple Journal workflow, depending on available APIs and share support.
- Slack and Microsoft Teams update generation.
- Siri Shortcut capture.
- Home screen widget.
- Multi-language support.
- Web dashboard if needed.
- Team/workspace features.
- Creator plan with batch content generation and advanced templates.

## 8. Core User Flows

### 8.1 First Launch

1. User opens the app.
2. App briefly explains the value: record once, turn voice into notes, tasks, emails, journals, and posts.
3. App explains microphone usage before requesting permission.
4. User grants microphone permission.
5. App shows the main recording screen.

Acceptance criteria:

- User understands why microphone access is needed.
- Denied permissions show a clear recovery path to Settings.
- Onboarding is short and skippable after required permission context.

### 8.2 Record To Output

1. User taps record.
2. App starts recording and shows elapsed time.
3. User taps stop.
4. App allows playback.
5. App transcribes audio.
6. App suggests an output type from the transcript.
7. User taps the primary generate button or changes the output type.
8. App generates structured output.
9. App shows editable preview.
10. User saves, copies, shares, or exports.

Acceptance criteria:

- Recording can be started and stopped reliably.
- User can see recording state.
- User can recover from transcription or generation failure.
- Generated output can be edited before save/export.
- A successful output is saved to history.

### 8.3 Confirm Suggested Output Type

1. User records a note.
2. App reviews the transcript for explicit intent.
3. If the user clearly says what they want, such as "write an email", "make this a note", or "turn this into a todo list", the app uses that output type.
4. If the user does not clearly specify an output type, the app chooses the best likely type.
5. App shows a primary action such as `Generate Email` and a secondary `Change Type` action.
6. User confirms or changes the type.
7. App generates the chosen output.

Acceptance criteria:

- Output types are understandable without prompt-writing knowledge.
- Each type produces a distinct, useful structure.
- Explicit user intent takes priority over model guesswork.
- The suggested type is always visible before generation.
- User can change the suggested type before generation.
- User can regenerate with another output type from the same transcript.

### 8.4 Edit, Save, And Reuse

1. User reviews generated output.
2. User edits title and body.
3. User saves output.
4. User can reopen it from history.
5. User can copy/share/export from history.

Acceptance criteria:

- Edits are preserved.
- History displays meaningful title, output type, date, and preview.
- Delete is available and confirmed.

### 8.5 Basic Notion Export

1. User generates an output.
2. User chooses export/share to Notion.
3. App sends text through the native iOS Share Sheet.
4. User chooses Notion or another destination from the share menu.
5. User confirms completion outside the app.

Acceptance criteria:

- MVP has at least one usable path to get content into Notion.
- The app labels this as a basic export path, not full Notion sync.
- No Notion OAuth, token storage, workspace picker, or database mapping is required in v1.

## 9. Output Type Requirements

### 9.1 Note

Purpose: Clean a messy thought into a readable note.

Required structure:

- Title.
- Clean summary.
- Main points.
- Optional next steps if present.

Rules:

- Preserve the user's meaning.
- Remove filler words and repetition.
- Do not invent unsupported facts.

### 9.2 Todo List

Purpose: Extract actionable tasks from speech.

Required structure:

- Title.
- Task list.
- Optional due dates when explicitly stated or strongly implied.
- Optional priority suggestions.

Rules:

- Each task should start with an action verb.
- Ambiguous deadlines should be flagged instead of silently invented.
- Personal and work tasks may be grouped when obvious.

### 9.3 Email

Purpose: Turn spoken intent into a polished email.

Required structure:

- Subject.
- Greeting.
- Body.
- Closing.

Rules:

- Default tone should be clear, warm, and professional.
- Preserve key details and requests.
- Do not add commitments the user did not make.

### 9.4 Journal Entry

Purpose: Turn reflection into a private, readable entry.

Required structure:

- Date-aware title.
- Journal body.
- Mood or theme summary when supported by the transcript.
- Optional tomorrow focus if present.

Rules:

- Keep the user's voice.
- Do not over-clinicalize emotions.
- Avoid giving mental health diagnoses or strong psychological claims.

### 9.5 Content Post

Purpose: Turn an idea into a usable social/content draft.

Required structure:

- Hook.
- Draft post or script.
- Optional caption.
- Optional call to action.

Rules:

- Default format should be broadly useful for Instagram/LinkedIn style posts.
- Do not fabricate expertise, results, or claims.
- Preserve the user's original idea.

## 10. Data Model

The MVP should store the minimum useful data locally.

### 10.1 VoiceNote

Fields:

- `id`: unique identifier.
- `createdAt`: timestamp.
- `updatedAt`: timestamp.
- `durationSeconds`: recording duration.
- `audioLocalUri`: local audio file reference if audio retention is enabled.
- `audioRetention`: enum: `temporary`, `saved`, `deleted`.
- `transcript`: raw transcript text.
- `language`: detected or selected language when available.
- `status`: enum: `recorded`, `transcribing`, `transcribed`, `generating`, `complete`, `failed`.
- `errorMessage`: user-safe error message if failed.

### 10.2 GeneratedOutput

Fields:

- `id`: unique identifier.
- `voiceNoteId`: parent voice note id.
- `createdAt`: timestamp.
- `updatedAt`: timestamp.
- `outputType`: enum: `note`, `todo_list`, `email`, `journal_entry`, `content_post`.
- `title`: editable title.
- `body`: editable output body.
- `structuredPayload`: optional JSON for tasks, email subject/body, content sections, or future integrations.
- `sourceTranscriptHash`: hash for traceability without duplicating sensitive text when appropriate.
- `isFavorite`: boolean.

### 10.3 ExportEvent

Fields:

- `id`: unique identifier.
- `generatedOutputId`: exported output id.
- `createdAt`: timestamp.
- `destination`: enum: `clipboard`, `share_sheet`, `notion_basic`, `other`.
- `status`: enum: `success`, `failed`, `cancelled`.
- `errorMessage`: user-safe error message if failed.

### 10.4 UserSettings

Fields:

- `preferredOutputType`: optional default output type.
- `saveAudioByDefault`: boolean, default should be false or clearly explained.
- `deleteAudioAfterTranscription`: boolean, default true for v1.
- `privacyAnalyticsEnabled`: boolean.
- `subscriptionStatus`: enum: `free`, `pro`, `annual`, `creator`, `unknown`.
- `monthlyNoteCount`: count for free-tier limits.

## 11. AI And Transcription Requirements

### 11.1 Transcription

Requirements:

- Must support accurate speech-to-text for natural spoken notes.
- Must handle filler words, pauses, and imperfect speech.
- Must return useful errors for poor audio, network failure, or provider failure.
- Should preserve enough punctuation and sentence boundaries for downstream AI transformation.
- Should support at least English for MVP.
- Should not store audio with the provider longer than needed, where configurable.
- MVP uses cloud transcription through the app backend for speed and quality.
- Do not highlight cloud transcription in marketing copy or primary product messaging.
- Accurately disclose data processing in App Store privacy details, the privacy policy, and privacy/settings surfaces as required.

Provider candidates:

- OpenAI audio transcription APIs.
- Apple Speech framework for on-device or native transcription where quality and constraints fit.
- Other transcription providers only if they improve cost, latency, privacy, or accuracy.

Initial recommendation:

- Use a server-mediated OpenAI transcription flow for MVP if it gives the fastest reliable path.
- Re-evaluate Apple on-device speech and other local transcription options after the cloud MVP validates the core flow.

### 11.2 AI Transformation

Requirements:

- Each output type must use a clear prompt or structured generation contract.
- Responses should be parseable into title, body, and optional structured payload.
- The app must prevent unsupported invention as much as practical.
- The AI should ask for confirmation only when needed; MVP can show uncertain output notes instead of conversational follow-up.
- Generation should complete quickly enough that the full record-to-output path feels usable.
- User-facing errors must avoid technical provider details.
- MVP uses cloud AI generation through the app backend for output quality and implementation speed.
- Do not highlight cloud AI generation in marketing copy or primary product messaging.
- Use neutral in-app language such as `Processing`, `Transcribing`, and `Generating`.

Model candidates:

- OpenAI text generation model suitable for fast structured transformation.
- Apple Foundation Models for future on-device transformation where available.
- Embedded local LLM runtimes such as MLC LLM or similar only after a dedicated feasibility spike.
- Lower-cost model for simple cleanup if quality is acceptable.
- Higher-quality model for paid/pro generation if needed later.

### 11.3 Prompting Rules

- Do not require the user to write prompts.
- Keep system prompts focused on transformation, structure, and faithfulness.
- Make output type requirements explicit.
- Return consistent structure.
- Do not fabricate facts, dates, names, deadlines, or claims.
- Flag ambiguity in plain language.
- Keep sensitive content private and avoid unnecessary retention.

## 12. Integration Requirements

### 12.1 MVP Integrations

Required:

- iOS clipboard copy.
- iOS native share sheet.
- Basic Notion export path.

Notion v1 decision:

- Use the native iOS Share Sheet for Notion export.
- Format shared output cleanly, preferably as Markdown-friendly text.
- Do not add direct Notion API, OAuth, token storage, workspace selection, page creation, or database mapping in v1.
- Revisit direct Notion API in v1.5 or v2 after the core record-to-output loop is validated.

### 12.2 Later Integrations

- Apple Reminders.
- Apple Calendar.
- Google Calendar.
- Gmail.
- Apple Mail.
- Apple Notes.
- Day One.
- Apple Journal if viable.
- Todoist.
- Things.
- TickTick.
- Slack.
- Microsoft Teams.
- Google Docs.
- Full Notion database mapping.
- Direct Notion API page creation.

Each integration must define:

- User story.
- Authentication requirements.
- Data mapping.
- Confirmation flow.
- Failure states.
- Privacy implications.
- Test plan.

## 13. Privacy And Security Requirements

Voice notes may contain sensitive personal, work, client, health, financial, or relationship information. Privacy is a product requirement, not a later enhancement.

MVP requirements:

- Explain microphone permission before requesting it.
- Explain microphone access in simple user-benefit language.
- Do not lead onboarding or marketing with cloud-processing details.
- Accurately describe data processing in the privacy policy, App Store privacy details, and an accessible privacy/settings screen.
- Do not store audio after successful transcription by default in v1.
- Playback may be available only before transcription cleanup, unless a temporary file still exists.
- Later versions may add an explicit save-audio option with quality-of-life features such as replay, rename, retention settings, and storage controls.
- Let users delete individual notes and generated outputs.
- Store local data securely using platform-appropriate storage.
- Store API keys only on a backend, never in the app bundle.
- Use HTTPS for all network calls.
- Avoid logging raw transcripts, generated outputs, or audio URLs.
- Use user-safe error reporting that does not leak sensitive content.
- Do not use user content for model training unless the user explicitly opts in.
- Do not market v1 as fully local or fully offline.
- Future total privacy mode must make a clear distinction between local processing and cloud processing.
- Do not make false privacy claims or imply local-only processing before it exists.
- Prepare for account/data deletion in a later account-based release.

Security requirements:

- Server endpoints must validate requests.
- Secrets must be stored in environment variables or managed secret storage.
- Subscription and entitlement checks must not rely only on client-side state.
- If auth is added, use proven identity/payment providers.
- If Notion OAuth is added in a later version, tokens must be stored securely and revocable.

## 14. Non-Functional Requirements

Performance:

- The app should feel responsive while recording.
- The full voice-to-output path should target about 30 seconds for a typical short note.
- Loading states should show progress where possible.

Reliability:

- Recording failures must be recoverable.
- Network failures must not silently lose local recordings.
- Transcription/generation retry should be available when practical.
- Local history should not corrupt if generation fails.

Usability:

- Main screen must prioritize recording.
- Output type selection must be simple.
- Empty states must invite recording, not explain too much.
- Buttons and controls must be thumb-friendly on iPhone.

Accessibility:

- Support dynamic type where practical.
- Provide clear labels for buttons.
- Avoid relying on color alone for state.
- Ensure sufficient contrast.

Observability:

- Track non-sensitive events such as recording started, transcription succeeded, output generated, copied, shared, and exported.
- Do not track raw transcript or generated content.
- Use analytics only after clear disclosure and with opt-out if needed.

Cost control:

- Track transcription and generation usage.
- Enforce free-tier note limits.
- Consider maximum recording duration for free users.
- Add server-side rate limits before public launch.

## 15. Monetization Requirements

Initial model:

- Free tier: 10 voice notes per month.
- Pro monthly: $7.99/month.
- Annual: $59.99/year.
- Creator plan later: $12.99/month.

MVP requirements:

- Product should be architected to support subscriptions.
- Free-tier counting should be defined even if payments are enabled later.
- Paywall should not block early usability testing unless needed.
- App Store subscription setup is required before public paid launch.

Paid feature assumptions:

- Unlimited or high-limit notes.
- All output types.
- Future integrations.
- Future advanced templates and creator workflows.

Open monetization questions:

- Should the first TestFlight be fully free, subscription-gated, or free with usage limits?
- Should the App Store launch include subscriptions immediately or start free with a waitlist/pricing test?
- What note length or generation limits should protect AI costs?

## 16. Technical Stack Recommendation

### 16.1 Options Considered

React Native / Expo:

- Pros:
  - Faster MVP development.
  - Easier future Android support.
  - Large ecosystem for UI, storage, sharing, and subscriptions.
  - EAS can support iOS builds and TestFlight deployment.
- Cons:
  - Some deep iOS integrations may require native modules.
  - Siri Shortcuts, widgets, and advanced Apple integrations can become more complex.
  - Audio edge cases may require extra native work.

Swift / SwiftUI:

- Pros:
  - Best native iOS polish.
  - Strong fit for microphone, playback, Apple Reminders, Calendar, widgets, and Siri Shortcuts.
  - Better long-term Apple ecosystem integration.
- Cons:
  - Slower if future Android support matters.
  - Requires separate Android implementation later.
  - Backend and AI integration work remains separate either way.

### 16.2 Recommendation

Recommended MVP stack: **React Native with Expo**, plus a lightweight backend for AI/transcription calls.

Reasoning:

- The MVP risk is product flow quality, not native Apple integration depth.
- Expo supports fast iteration, iOS testing, native share sheet, audio recording/playback, local storage, and EAS deployment.
- Future Android support remains possible.
- Deep Apple integrations can be added later with config plugins, native modules, or a SwiftUI rewrite only if proven necessary.

Backend recommendation:

- Start with a simple Node/TypeScript API or serverless functions.
- Keep provider API keys off-device.
- Provide endpoints for transcription and generation.
- Add rate limiting and usage tracking before public launch.

Local storage recommendation:

- Use SQLite or a reliable local database abstraction for history.
- Use secure storage for tokens and sensitive settings.
- Keep audio files temporary by default.

Payments:

- Use RevenueCat or StoreKit integration when subscriptions are added.
- Prefer RevenueCat for speed and entitlement management unless native-only StoreKit is strongly preferred.

Analytics/crash reporting:

- Use privacy-conscious analytics with no transcript/output logging.
- Add crash reporting before TestFlight.

## 17. App Architecture Requirements

The app should separate:

- UI screens and components.
- Recording and playback services.
- Transcription API client.
- AI transformation API client.
- Domain models and output parsing.
- Local persistence.
- Export/share actions.
- Subscription/usage logic.
- Settings and privacy controls.

Suggested app modules:

- `recording`: microphone permission, record, stop, playback, temporary file handling.
- `transcription`: upload audio, receive transcript, retry, error handling.
- `generation`: output type prompts, structured response parsing, regeneration.
- `intent`: lightweight output type inference from transcript and explicit user commands.
- `history`: local storage, edit, delete, favorite/search later.
- `export`: clipboard, native iOS Share Sheet, basic Notion-through-share path.
- `settings`: privacy preferences, audio retention, subscription status.
- `backend`: server endpoints, provider adapters, rate limits, usage tracking.

## 18. UI Requirements

Core screens:

- Onboarding/privacy permission screen.
- Main record screen.
- Recording active state.
- Processing/transcribing state.
- Output type selection screen or panel.
- Suggested output confirmation state.
- Output preview/edit screen.
- History list.
- History detail.
- Settings/privacy screen.
- Paywall screen later.

Important states:

- First-run empty state.
- Microphone permission denied.
- Recording in progress.
- Recording paused only if supported; otherwise omit pause from MVP.
- Playback available.
- Transcription loading.
- Transcription failed.
- Generation loading.
- Generation failed.
- Saved successfully.
- Share/export cancelled.
- Usage limit reached.

UX constraints:

- No prompt box as the primary experience.
- No complex setup before first recording.
- Avoid long forms in MVP.
- Output editing should happen in a familiar text editor style.
- Export actions should be visible from the output screen.

## 19. App Store And Deployment Requirements

### 19.1 Apple Developer Setup

Requirements:

- Apple Developer Program account.
- App identifier.
- Bundle ID.
- App display name.
- App icon.
- Microphone usage description.
- Any required privacy manifest entries.
- App Store Connect app record.
- TestFlight configuration.

### 19.2 Build And Release

Requirements:

- EAS Build or native Xcode build pipeline, depending on final stack.
- Separate development, preview/TestFlight, and production environments.
- Environment variables for backend URLs and non-secret config.
- Backend production deployment before App Store review.
- Crash reporting enabled before TestFlight.
- Basic analytics enabled only for non-sensitive events.
- Versioning policy for builds and releases.

### 19.3 App Review Readiness

Requirements:

- Privacy policy URL.
- Terms of service URL if subscriptions are used.
- Clear explanation of microphone, transcription, AI processing, and data retention.
- In-app purchase/subscription metadata if monetized at launch.
- Restore purchases if subscriptions are enabled.
- No hidden or broken features in review build.
- Demo account only if account login is required.
- App should function in review without requiring unavailable external setup.

### 19.4 App Store Listing

Requirements:

- App name and subtitle.
- Keywords focused on voice notes, AI notes, transcription, todo, journal, productivity, Notion.
- Short promotional text.
- Description with clear before/after value.
- Screenshots showing:
  - Record voice note.
  - Choose output type.
  - Confirm suggested output type.
  - Generated todo/email/note.
  - Share/export.
  - History.
- App preview video if possible.
- Support URL.
- Privacy policy URL.
- Category recommendation: Productivity.

## 20. Marketing Requirements

Marketing should not rely on cold calls or direct sales.

Launch channels:

- Instagram Reels.
- Instagram carousels.
- Short before/after demos.
- App Store search.
- Paid ads after core conversion is understood.
- SEO landing pages.
- Creator workflows.
- Free templates.

Product implications:

- Every major feature should be easy to demonstrate visually.
- The app should produce before/after examples that can be shown in short videos.
- Creator output mode should be polished enough to market.
- App Store screenshots should show concrete transformations, not abstract AI claims.

## 21. Milestones And Deadline

Target MVP deadline: 2026-07-15.

Milestones:

1. Requirements complete and approved.
   - Target: 2026-05-23.
   - Deliverable: `requirements.md`.

2. UX flow and wireframe plan.
   - Target: 2026-05-26.
   - Deliverable: screen map, core user flows, MVP UI requirements.

3. Technical setup.
   - Target: 2026-05-30.
   - Deliverable: app project, backend skeleton, environment setup, build scripts.

4. Recording prototype.
   - Target: 2026-06-04.
   - Deliverable: record, stop, playback, local temporary audio handling.

5. Transcription prototype.
   - Target: 2026-06-10.
   - Deliverable: audio upload, transcript result, failure handling.

6. AI output prototype.
   - Target: 2026-06-16.
   - Deliverable: five output modes using structured generation.

7. MVP UI integration.
   - Target: 2026-06-24.
   - Deliverable: main flow from recording to editable output.

8. History and export.
   - Target: 2026-06-30.
   - Deliverable: local history, delete, copy, share, basic Notion path.

9. Privacy, settings, and usage limits.
   - Target: 2026-07-05.
   - Deliverable: settings, audio retention controls, free-tier counters, privacy text.

10. QA and TestFlight readiness.
    - Target: 2026-07-10.
    - Deliverable: bug fixes, crash reporting, TestFlight build.

11. App Store launch preparation.
    - Target: 2026-07-15.
    - Deliverable: App Store listing assets, privacy policy, review-ready build.

Post-MVP privacy-mode investigation:

- Test Apple Speech on-device transcription quality, latency, language support, device coverage, and Expo/native-module implications.
- Test Apple Foundation Models for note cleanup, todo extraction, email drafting, journal formatting, and content post generation.
- Test one embedded local LLM runtime only if Apple Foundation Models are insufficient or unavailable for the target devices.
- Decide whether to ship `Total Privacy Mode`, `Private Local Mode`, or `Cloud Quality Mode` as a later feature.

## 22. Product To Do / Backlog

Privacy-mode backlog:

- After the cloud MVP flow works, create a dedicated technical spike for local processing.
- Prototype on-device speech-to-text using Apple Speech where supported.
- Prototype on-device transformation using Apple Foundation Models where supported.
- Compare local output quality against cloud output quality for all five MVP output types.
- Measure local processing latency, battery impact, device heat, app size impact, and supported-device coverage.
- Decide whether total privacy is a separate mode, a premium feature, or the default on supported devices.
- Do not claim fully local processing in marketing until the shipped app actually supports it.
- Cloud processing should be treated as implementation detail in product positioning, not as a front-and-center feature claim.

## 23. Testing Requirements

MVP test coverage should focus on risky behavior:

- Recording permission states.
- Recording start/stop lifecycle.
- Audio playback availability.
- Transcription API success and failure.
- AI generation for each output type.
- Structured output parsing.
- Local history save/edit/delete.
- Copy/share/export actions.
- Usage limit enforcement.
- Privacy settings such as audio deletion behavior.

Manual QA scenarios:

- First launch with microphone permission accepted.
- First launch with microphone permission denied.
- Short recording under 15 seconds.
- Longer recording around 3 minutes.
- Poor audio or silence.
- Network offline during transcription.
- AI generation failure.
- Regenerate another output type from same transcript.
- Delete saved note.
- Share output to Notion using share sheet.
- App restart preserves history.

## 24. Definition Of Done For MVP

The MVP is done when a user can:

- Record a voice note on iPhone.
- Play back the recording when available.
- Get an accurate transcription.
- Convert the transcript into at least five useful output types.
- Edit the generated result.
- Save it to local history.
- Copy it.
- Share/export it.
- Use a basic path to get content into Notion.
- Delete notes/outputs.
- Understand what happened if recording, transcription, generation, or export fails.

The MVP is not done if:

- The user must write prompts to get useful outputs.
- Audio or transcripts are lost silently on failure.
- API keys are exposed in the mobile app.
- There is no clear privacy explanation.
- The app cannot be distributed through TestFlight.

## 25. Requirement Change Process

When requirements change:

1. Update this file in the relevant section.
2. Update `product-context.md` if the change affects product strategy, positioning, target users, roadmap, monetization, or major decisions.
3. Add a dated note to the change log below.
4. If implementation has started, identify affected files, tests, and milestones before coding.

## 26. Change Log

- 2026-05-23: Locked v1 output selection approach: hybrid suggested output type, with explicit user intent taking priority and a visible change-type option before generation.
- 2026-05-23: Refined cloud-processing positioning: do not highlight cloud transcription/generation in marketing or primary UX, but keep required privacy disclosures accurate and accessible.
- 2026-05-23: Locked v1 AI/transcription approach as cloud-first through backend-mediated provider calls; added post-MVP local/privacy-mode investigation for Apple Speech, Apple Foundation Models, and local LLM runtimes.
- 2026-05-23: Locked v1 audio retention decision: delete local audio after successful transcription by default; keep TestFlight/subscription timing open.
- 2026-05-23: Locked MVP Notion/export approach to native iOS Share Sheet; moved direct Notion API to later roadmap.
- 2026-05-23: Created initial requirements document from `product-context.md` and project instructions.

## 27. Open Questions

Product:

- What confidence threshold or rule set should trigger each suggested output type?
- Should the first TestFlight be fully free, subscription-gated, or free with usage limits?
- What maximum recording length should the free tier allow?
- What quality-of-life features are required before offering a user-controlled save-audio option?
- Should history store raw transcripts, or only generated outputs, for privacy?
- What exact promise should future local processing use: `Total Privacy Mode`, `Private Local Mode`, or `Offline Mode`?

Technical:

- Which transcription provider gives the best balance of quality, speed, cost, and privacy for MVP?
- Should the backend be serverless from day one or a small persistent API service?
- Which on-device path should be tested first after MVP: Apple Speech, Apple Foundation Models, or embedded local LLM runtime?
- What exact text/Markdown format should be shared to Notion from v1 outputs?
- Which local database should be used for Expo: SQLite directly, WatermelonDB, Realm, or another option?
- Which analytics/crash tools best fit the privacy requirements?

Launch:

- What final app name should be used in the App Store?
- What landing page domain should host privacy policy and marketing pages?
- What App Store keywords should be tested first?
- What screenshots and demo scripts should be produced before review?
