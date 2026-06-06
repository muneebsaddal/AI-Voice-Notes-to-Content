# Immediate Flow Reliability Acceptance Checklist

Date: 2026-06-07

## Automated Commands

Run each command separately:

```bash
npm run recording:test
```

Expected under 2 seconds. Stop after 30 seconds with no result.

```bash
npm run frontend:test
```

Expected under 2 seconds. Stop after 30 seconds with no result.

```bash
npm run backend:test
```

Expected under 5 seconds. Stop after 30 seconds with no result.

```bash
npm run transcription:test
```

Expected under 10 seconds without real model inference. Stop after 30 seconds
with no result.

```bash
npm run typecheck
```

Expected under 20 seconds. Stop after 60 seconds with no result.

```bash
npm run lint
```

Expected under 20 seconds. Stop after 60 seconds with no result.

## Device And Web Matrix

1. Web: record, transcribe, confirm or change type, generate, and view output.
2. Android Expo Go: record 5-15 seconds, transcribe, confirm or change type,
   generate, and view output.
3. Confirm Android development diagnostics report `m4a` and `audio/mp4` without
   printing the URI or transcript.
4. Stop the Python service after recording. Confirm retry keeps the same audio,
   restart the service, and retry successfully without recording again.
5. Repeat one transcript across Note, Todo List, Email, Journal Entry, and
   Content Post.
6. Configure an invalid OpenAI credential. Confirm generation returns a safe
   configuration error and does not return a local formatter result.
7. Record the successful end-to-end duration and compare it with the 30-second
   product target.

## Five-Output Review Table

| Input | Selected type | Generated title | Key facts preserved | Invention found |
|---|---|---|---|---|
| Jamie reviewed invoice 4821 and will check it again Tuesday. | Note |  | Jamie, 4821, Tuesday |  |
| I still need to ask Priya about invoice 4821 before Friday. | Todo List |  | Priya, 4821, Friday |  |
| Priya needs a polite update about invoice 4821 before Tuesday. | Email |  | Priya, 4821, Tuesday |  |
| I felt relieved when Jamie approved ZX-42 on Tuesday. | Journal Entry |  | Jamie, ZX-42, Tuesday |  |
| The useful lesson from Priya's ZX-42 launch on Friday is to test the smallest promise first. | Content Post |  | Priya, ZX-42, Friday |  |
