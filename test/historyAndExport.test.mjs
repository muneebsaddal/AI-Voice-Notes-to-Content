import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  createHistoryItem,
  HistoryDataError,
  parseHistoryItems,
  upsertHistoryItem,
} from "../src/history/historyModel.ts";
import { createHistoryRepository } from "../src/history/historyRepository.ts";
import { createEncryptedStorage } from "../src/history/encryptedStorage.ts";
import { formatOutputForExport } from "../src/export/outputFormat.ts";

const generatedOutput = {
  id: "email-1",
  outputType: "email",
  title: "Thursday workshop",
  createdAt: "2026-06-07T12:00:00.000Z",
  createdAtLabel: "Today",
  schemaVersion: "1.0",
  warnings: [],
  preview: "Hi Jamie, quick note before Thursday.",
  body: "Hi Jamie,\n\nQuick note before Thursday.",
  payload: {
    type: "email",
    subject: "Thursday workshop",
    greeting: "Hi Jamie,",
    body: "Quick note before Thursday.",
    closing: "Thanks",
  },
};

describe("history model", () => {
  it("stores only generated output fields needed by history", () => {
    const item = createHistoryItem(generatedOutput, {
      id: "saved-1",
      now: new Date("2026-06-07T13:00:00.000Z"),
    });

    assert.deepEqual(item, {
      id: "saved-1",
      sourceOutputId: "email-1",
      outputType: "email",
      title: "Thursday workshop",
      body: "Hi Jamie,\n\nQuick note before Thursday.",
      preview: "Hi Jamie, Quick note before Thursday.",
      createdAt: "2026-06-07T13:00:00.000Z",
      updatedAt: "2026-06-07T13:00:00.000Z",
    });
    assert.equal("payload" in item, false);
    assert.equal("transcript" in item, false);
  });

  it("upserts one saved record and keeps newest items first", () => {
    const first = createHistoryItem(generatedOutput, {
      id: "saved-1",
      now: new Date("2026-06-07T13:00:00.000Z"),
    });
    const second = {
      ...first,
      id: "saved-2",
      sourceOutputId: "note-2",
      outputType: "note",
      title: "Later note",
      createdAt: "2026-06-07T14:00:00.000Z",
      updatedAt: "2026-06-07T14:00:00.000Z",
    };

    assert.deepEqual(
      upsertHistoryItem([first], second).map((item) => item.id),
      ["saved-2", "saved-1"],
    );
    assert.equal(
      upsertHistoryItem([first, second], { ...first, title: "Updated" }).length,
      2,
    );
    assert.deepEqual(
      upsertHistoryItem([first], {
        ...first,
        id: "duplicate-save",
        title: "Rapid second save",
      }).map((item) => item.id),
      ["duplicate-save"],
    );
  });

  it("drops malformed persisted records instead of corrupting history", () => {
    const valid = createHistoryItem(generatedOutput, {
      id: "saved-1",
      now: new Date("2026-06-07T13:00:00.000Z"),
    });

    assert.deepEqual(
      parseHistoryItems(
        JSON.stringify([
          { ...valid, transcript: "private raw transcript", payload: { secret: true } },
        ]),
      ),
      [valid],
    );
    assert.throws(
      () => parseHistoryItems(JSON.stringify([valid, { id: "broken" }])),
      HistoryDataError,
    );
    assert.throws(() => parseHistoryItems("not-json"), HistoryDataError);
  });
});

describe("history repository", () => {
  it("persists save, delete, and clear operations", async () => {
    let value = null;
    const storage = {
      getItem: async () => value,
      setItem: async (_key, nextValue) => {
        value = nextValue;
      },
      removeItem: async () => {
        value = null;
      },
    };
    const repository = createHistoryRepository(storage);
    const item = createHistoryItem(generatedOutput, {
      id: "saved-1",
      now: new Date("2026-06-07T13:00:00.000Z"),
    });

    await repository.save(item);
    assert.deepEqual(await repository.list(), [item]);

    await repository.deleteById(item.id);
    assert.deepEqual(await repository.list(), []);

    await repository.save(item);
    await repository.clear();
    assert.deepEqual(await repository.list(), []);
  });

  it("allows later mutations after a storage write fails", async () => {
    let value = null;
    let shouldFail = true;
    const storage = {
      getItem: async () => value,
      setItem: async (_key, nextValue) => {
        if (shouldFail) {
          shouldFail = false;
          throw new Error("disk unavailable");
        }
        value = nextValue;
      },
      removeItem: async () => {
        value = null;
      },
    };
    const repository = createHistoryRepository(storage);
    const item = createHistoryItem(generatedOutput, {
      id: "saved-1",
      now: new Date("2026-06-07T13:00:00.000Z"),
    });

    await assert.rejects(repository.save(item), /disk unavailable/);
    await repository.save(item);
    assert.deepEqual(await repository.list(), [item]);
  });

  it("does not overwrite corrupt persisted history", async () => {
    let value = "not-json";
    const storage = {
      getItem: async () => value,
      setItem: async (_key, nextValue) => {
        value = nextValue;
      },
      removeItem: async () => {
        value = null;
      },
    };
    const repository = createHistoryRepository(storage);
    const item = createHistoryItem(generatedOutput, {
      id: "saved-1",
      now: new Date("2026-06-07T13:00:00.000Z"),
    });

    await assert.rejects(repository.save(item), HistoryDataError);
    assert.equal(value, "not-json");
  });

  it("serializes concurrent saves without losing unrelated outputs", async () => {
    let value = null;
    const storage = {
      getItem: async () => value,
      setItem: async (_key, nextValue) => {
        await new Promise((resolve) => setTimeout(resolve, 1));
        value = nextValue;
      },
      removeItem: async () => {
        value = null;
      },
    };
    const repository = createHistoryRepository(storage);
    const first = createHistoryItem(generatedOutput, {
      id: "saved-1",
      now: new Date("2026-06-07T13:00:00.000Z"),
    });
    const second = createHistoryItem(
      { ...generatedOutput, id: "note-2", outputType: "note", title: "Second" },
      {
        id: "saved-2",
        now: new Date("2026-06-07T14:00:00.000Z"),
      },
    );

    await Promise.all([repository.save(first), repository.save(second)]);

    assert.deepEqual(
      (await repository.list()).map((item) => item.id),
      ["saved-2", "saved-1"],
    );
  });
});

describe("encrypted history storage", () => {
  it("encrypts persisted native values and decrypts them for the repository", async () => {
    let rawValue = null;
    let storedKey = null;
    let randomCall = 0;
    const encryptedStorage = createEncryptedStorage(
      {
        getItem: async () => rawValue,
        setItem: async (_key, value) => {
          rawValue = value;
        },
        removeItem: async () => {
          rawValue = null;
        },
      },
      {
        getItem: async () => storedKey,
        setItem: async (value) => {
          storedKey = value;
        },
      },
      async (length) => {
        randomCall += 1;
        return new Uint8Array(length).fill(randomCall);
      },
    );

    await encryptedStorage.setItem("history", "private generated output");

    assert.equal(rawValue.includes("private generated output"), false);
    assert.equal(storedKey.length, 64);
    assert.equal(
      await encryptedStorage.getItem("history"),
      "private generated output",
    );

    rawValue = `${rawValue.slice(0, -1)}${rawValue.endsWith("0") ? "1" : "0"}`;
    await assert.rejects(
      encryptedStorage.getItem("history"),
      /could not be decrypted/,
    );
  });
});

describe("output export", () => {
  it("creates Markdown-friendly share text without private metadata", () => {
    assert.equal(
      formatOutputForExport({
        title: "Thursday workshop",
        body: "Hi Jamie,\n\nQuick note before Thursday.",
      }),
      "# Thursday workshop\n\nHi Jamie,\n\nQuick note before Thursday.",
    );
  });
});
