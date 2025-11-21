import CryptoJS from 'crypto-js';

// Use a secret key from environment variables
// In production, this should come from your build process
const SECRET_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'default-dev-key-change-in-production';

/**
 * Encrypt data before storing in IndexedDB
 */
export function encrypt(data: any): string {
  try {
    const jsonString = JSON.stringify(data);
    return CryptoJS.AES.encrypt(jsonString, SECRET_KEY).toString();
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt data retrieved from IndexedDB
 */
export function decrypt<T = any>(encryptedData: string): T {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
    const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decryptedString);
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Hash sensitive data (one-way encryption)
 */
export function hash(data: string): string {
  return CryptoJS.SHA256(data).toString();
}

/**
 * Generate a random encryption key
 */
export function generateKey(): string {
  return CryptoJS.lib.WordArray.random(256 / 8).toString();
}

/**
 * Secure cache manager with encryption
 */
export class SecureCacheManager {
  /**
   * Store encrypted data in IndexedDB
   */
  static async setSecure(key: string, data: any, expiresIn?: number): Promise<void> {
    const { cacheManager } = await import('./cacheManager');
    const encryptedData = encrypt(data);
    await cacheManager.set(key, encryptedData, expiresIn);
  }

  /**
   * Retrieve and decrypt data from IndexedDB
   */
  static async getSecure<T = any>(key: string): Promise<T | null> {
    const { cacheManager } = await import('./cacheManager');
    const encryptedData = await cacheManager.get<string>(key);
    
    if (!encryptedData) {
      return null;
    }

    try {
      return decrypt<T>(encryptedData);
    } catch (error) {
      console.error(`Failed to decrypt data for key ${key}:`, error);
      // Remove corrupted data
      await cacheManager.remove(key);
      return null;
    }
  }

  /**
   * Remove encrypted data from cache
   */
  static async removeSecure(key: string): Promise<void> {
    const { cacheManager } = await import('./cacheManager');
    await cacheManager.remove(key);
  }
}
