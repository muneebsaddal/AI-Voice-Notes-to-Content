import AsyncStorage from "@react-native-async-storage/async-storage";
import { getRandomBytesAsync } from "expo-crypto";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { createEncryptedStorage } from "./encryptedStorage";
import { createHistoryRepository } from "./historyRepository";
import { createMemoryHistoryStorage } from "./memoryHistoryStorage";

const HISTORY_ENCRYPTION_KEY = "voice-notes.history.encryption-key.v1";

const nativeStorage = createEncryptedStorage(
  AsyncStorage,
  {
    getItem: async () =>
      await SecureStore.getItemAsync(HISTORY_ENCRYPTION_KEY, {
        keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      }),
    setItem: async (value) => {
      await SecureStore.setItemAsync(HISTORY_ENCRYPTION_KEY, value, {
        keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      });
    },
  },
  getRandomBytesAsync,
);

// Web is a development preview surface. Avoid persisting sensitive generated
// content in unencrypted browser storage.
const platformStorage =
  Platform.OS === "web" ? createMemoryHistoryStorage() : nativeStorage;

export const historyRepository = createHistoryRepository(platformStorage);
