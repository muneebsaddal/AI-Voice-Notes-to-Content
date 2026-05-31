import { createServer } from "node:http";

import { createApp } from "./app";

const defaultPort = 3333;
const port = Number.parseInt(process.env.PORT ?? `${defaultPort}`, 10);
const host = process.env.HOST ?? "127.0.0.1";

const server = createServer(createApp());

server.listen(port, host, () => {
  console.info(`voice-notes-api mock server listening on http://${host}:${port}`);
});
