import {
  parseHistoryItems,
  upsertHistoryItem,
} from "./historyModel.ts";
import type { SavedHistoryItem } from "../types";

export const HISTORY_STORAGE_KEY = "@voice-notes/history/v1";

export type HistoryStorage = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
};

export type HistoryRepository = {
  list: () => Promise<SavedHistoryItem[]>;
  save: (item: SavedHistoryItem) => Promise<SavedHistoryItem[]>;
  deleteById: (id: string) => Promise<SavedHistoryItem[]>;
  clear: () => Promise<void>;
};

export function createHistoryRepository(
  storage: HistoryStorage,
): HistoryRepository {
  let pendingMutation = Promise.resolve();

  const list = async () =>
    parseHistoryItems(await storage.getItem(HISTORY_STORAGE_KEY));

  const mutate = async (
    mutation: (items: SavedHistoryItem[]) => SavedHistoryItem[],
  ) => {
    let result: SavedHistoryItem[] = [];
    const operation = pendingMutation.then(async () => {
      result = mutation(await list());
      await storage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(result));
    });
    pendingMutation = operation.then(
      () => undefined,
      () => undefined,
    );
    await operation;
    return result;
  };

  return {
    list,
    save: async (item) =>
      await mutate((items) => upsertHistoryItem(items, item)),
    deleteById: async (id) =>
      await mutate((items) => items.filter((item) => item.id !== id)),
    clear: async () => {
      const operation = pendingMutation.then(async () => {
        await storage.removeItem(HISTORY_STORAGE_KEY);
      });
      pendingMutation = operation.then(
        () => undefined,
        () => undefined,
      );
      await operation;
    },
  };
}
