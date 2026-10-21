import { xchacha20poly1305 } from "@noble/ciphers/chacha.js";
import {
  bytesToHex,
  bytesToUtf8,
  hexToBytes,
  utf8ToBytes,
} from "@noble/ciphers/utils.js";
import type { HistoryStorage } from "./historyRepository.ts";

const ENCRYPTED_VALUE_PREFIX = "enc:v1";

export type EncryptionKeyStore = {
  getItem: () => Promise<string | null>;
  setItem: (value: string) => Promise<void>;
};

export function createEncryptedStorage(
  storage: HistoryStorage,
  keyStore: EncryptionKeyStore,
  randomBytes: (length: number) => Promise<Uint8Array>,
): HistoryStorage {
  let keyPromise: Promise<Uint8Array> | null = null;

  const getKey = () => {
    if (!keyPromise) {
      const pendingKey = (async () => {
        const storedKey = await keyStore.getItem();
        if (storedKey) {
          const key = hexToBytes(storedKey);
          if (key.length !== 32) {
            throw new Error("History encryption key is invalid.");
          }
          return key;
        }

        const key = await randomBytes(32);
        if (key.length !== 32) {
          throw new Error("History encryption key generation failed.");
        }
        await keyStore.setItem(bytesToHex(key));
        return key;
      })();
      keyPromise = pendingKey.catch((error) => {
        keyPromise = null;
        throw error;
      });
    }

    return keyPromise;
  };

  return {
    getItem: async (key) => {
      const storedValue = await storage.getItem(key);
      if (storedValue === null) {
        return null;
      }

      const [prefix, version, nonceHex, ciphertextHex, ...unexpected] =
        storedValue.split(":");
      if (
        `${prefix}:${version}` !== ENCRYPTED_VALUE_PREFIX ||
        !nonceHex ||
        !ciphertextHex ||
        unexpected.length > 0
      ) {
        throw new Error("Saved history is not in a supported encrypted format.");
      }

      try {
        const keyBytes = await getKey();
        const plaintext = xchacha20poly1305(
          keyBytes,
          hexToBytes(nonceHex),
        ).decrypt(hexToBytes(ciphertextHex));
        return bytesToUtf8(plaintext);
      } catch {
        throw new Error("Saved history could not be decrypted.");
      }
    },
    setItem: async (key, value) => {
      const [keyBytes, nonce] = await Promise.all([
        getKey(),
        randomBytes(24),
      ]);
      if (nonce.length !== 24) {
        throw new Error("History encryption nonce generation failed.");
      }

      const ciphertext = xchacha20poly1305(keyBytes, nonce).encrypt(
        utf8ToBytes(value),
      );
      await storage.setItem(
        key,
        `${ENCRYPTED_VALUE_PREFIX}:${bytesToHex(nonce)}:${bytesToHex(ciphertext)}`,
      );
    },
    removeItem: async (key) => {
      await storage.removeItem(key);
    },
  };
}
