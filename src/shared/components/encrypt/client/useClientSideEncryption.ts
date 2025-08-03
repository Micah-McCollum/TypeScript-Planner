import { useState, useEffect, useCallback } from "react";

const KEY_NAME = "encryptionKey";

export const useClientSideEncryption = () => {
  const [key, setKey] = useState<CryptoKey | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const storedKey = sessionStorage.getItem(KEY_NAME);
      const newKey = storedKey
        ? await importKey(storedKey)
        : await generateKey().then(async (k) => {
            const exported = await exportKey(k);
            sessionStorage.setItem(KEY_NAME, exported);
            return k;
          });
      setKey(newKey);
      setReady(true);
    })();
  }, []);

  const generateKey = async (): Promise<CryptoKey> =>
    crypto.subtle.generateKey(
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"]
    );

  const exportKey = async (key: CryptoKey): Promise<string> => {
    const raw = await crypto.subtle.exportKey("raw", key);
    return btoa(String.fromCharCode(...new Uint8Array(raw)));
  };

  const importKey = async (b64: string): Promise<CryptoKey> => {
    const raw = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    return crypto.subtle.importKey("raw", raw, { name: "AES-GCM" }, true, [
      "encrypt",
      "decrypt",
    ]);
  };

   const clientSideOnlyEncryptionEncrypt = useCallback(
    async (text: string) => {
      if (!key) throw new Error("Key not ready");
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const data = new TextEncoder().encode(text);
      const encrypted = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        key,
        data
      );
      return btoa(String.fromCharCode(...iv, ...new Uint8Array(encrypted)));
    },
    [key]
  );

  const clientSideOnlyEncryptionDecrypt = useCallback(
    async (b64: string) => {
      if (!key) throw new Error("Key not ready");
      const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
      const iv = bytes.slice(0, 12);
      const data = bytes.slice(12);
      const decrypted = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv },
        key,
        data
      );
      return new TextDecoder().decode(decrypted);
    },
    [key]  // only re-create this function when `key` changes
  );

  return {
    clientSideOnlyEncryptionEncrypt,
    clientSideOnlyEncryptionDecrypt,
    ready,
  };
};