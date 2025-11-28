
/**
 * Simulated Encrypted SQLite System
 * Uses LocalStorage with Base64 encoding and a salt to simulate encryption.
 * In a real app, this would use SQLCipher or a secure backend database.
 */

const SALT = "POS_WALLET_SECURE_SALT_v1";

const encrypt = (data: any): string => {
    try {
        const json = JSON.stringify(data);
        // Simple obfuscation: Base64(SALT + JSON)
        return btoa(SALT + encodeURIComponent(json));
    } catch (e) {
        console.error("Encryption failed", e);
        return "";
    }
};

const decrypt = (cipher: string): any => {
    try {
        const decoded = decodeURIComponent(atob(cipher));
        if (decoded.startsWith(SALT)) {
            const json = decoded.substring(SALT.length);
            return JSON.parse(json);
        }
        return null;
    } catch (e) {
        console.error("Decryption failed", e);
        return null;
    }
};

export const SecureStorage = {
    setItem: (key: string, value: any) => {
        const cipher = encrypt(value);
        localStorage.setItem(key, cipher);
    },
    getItem: (key: string, defaultValue: any) => {
        const cipher = localStorage.getItem(key);
        if (!cipher) return defaultValue;
        const data = decrypt(cipher);
        return data !== null ? data : defaultValue;
    },
    clear: () => {
        localStorage.clear();
    }
};
