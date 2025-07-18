import { useState, useEffect } from "react";

const KEY_NAME = "encryptionKey";
export const useClientSideEncryption = () => {
    const [key, setKey] = useState<CryptoKey | null>(null);
    useEffect(() => {
        (async () => {
            const storedKey = sessionStorage.getItem(KEY_NAME);
            if (storedKey) {
                setKey(await importKey(storedKey));
            } else {
                const newKey = await generateKey();
                setKey(newKey);
                const exportedKey = await exportKey(newKey);
                sessionStorage.setItem(KEY_NAME, exportedKey);
            }
        })();
    }, []);

    const generateKey = async (): Promise<CryptoKey> => {
        return await crypto.subtle.generateKey(
            { name: "AES-GCM", length: 256 },
            true,
            ["encrypt", "decrypt"]
        );
    };

    const exportKey = async (key: CryptoKey): Promise<string> => {
        const rawKey = await crypto.subtle.exportKey("raw", key);
        return btoa(String.fromCharCode(...new Uint8Array(rawKey)));
    };
    const importKey = async (base64Key: string): Promise<CryptoKey> => {
        const rawKey = Uint8Array.from(atob(base64Key), (c) => c.charCodeAt(0));
        return await crypto.subtle.importKey(
            "raw",
            rawKey,
            { name: "AES-GCM" },
            true,
            ["encrypt", "decrypt"]
        );
    };

    const clientSideOnlyEncryptionEncrypt = async (text: string): Promise<string> => {
        if (!key) throw new Error("WHOOPS!");
        const encoder = new TextEncoder();
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const encryptedData = await crypto.subtle.encrypt(
            { name: "AES-GCM", iv },
            key,
            encoder.encode(text)
        );
        const encryptedArray = new Uint8Array(encryptedData);
        return btoa(String.fromCharCode(...iv, ...encryptedArray));
    };

    const clientSideOnlyEncryptionDecrypt = async (encryptedText: string): Promise<string> => {
        if (!key) throw new Error("OOPS!");
        const encryptedBytes = Uint8Array.from(atob(encryptedText), (c) => c.charCodeAt(0));
        const iv = encryptedBytes.slice(0, 12);
        const data = encryptedBytes.slice(12);

        const decryptedData = await crypto.subtle.decrypt(
            { name: "AES-GCM", iv },
            key,
            data
        );

        return new TextDecoder().decode(decryptedData);
    };

    return { clientSideOnlyEncryptionEncrypt, clientSideOnlyEncryptionDecrypt };
};
