import { createServer } from "node:http";

import { createApp } from "./app";
import {
  createTranscriptionProvider,
  getMaxAudioUploadBytes,
} from "./transcription/providerConfig";
import { createGenerationProvider } from "./generation/providerConfig";

const defaultPort = 3333;
const port = Number.parseInt(process.env.PORT ?? `${defaultPort}`, 10);
const host = process.env.HOST ?? "127.0.0.1";

const transcriptionProvider = createTranscriptionProvider();
const generationProvider = createGenerationProvider();
const server = createServer(createApp({
  transcriptionProvider,
  generationProvider,
  maxAudioUploadBytes: getMaxAudioUploadBytes(),
}));

server.listen(port, host, () => {
  console.info(`voice-notes-api listening on http://${host}:${port}`, {
    transcriptionProvider: transcriptionProvider.name,
    generationProvider: generationProvider.name,
  });
});
