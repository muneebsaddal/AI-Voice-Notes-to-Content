import type { HistoryStorage } from "./historyRepository.ts";

export function createMemoryHistoryStorage(): HistoryStorage {
  const values = new Map<string, string>();

  return {
    getItem: async (key) => values.get(key) ?? null,
    setItem: async (key, value) => {
      values.set(key, value);
    },
    removeItem: async (key) => {
      values.delete(key);
    },
  };
}
