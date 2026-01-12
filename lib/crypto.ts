/**
 * Client-side encryption utilities using Web Crypto API
 * AES-GCM 256-bit encryption for paste content
 */

/**
 * Convert ArrayBuffer to base64 string
 */
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Convert base64 string to ArrayBuffer
 */
export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Generate a new AES-GCM 256-bit encryption key
 */
export async function generateEncryptionKey(): Promise<CryptoKey> {
  return await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true, // extractable
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt content with the provided key
 * Returns the encrypted data and IV (initialization vector) as base64 strings
 */
export async function encryptContent(
  content: string,
  key: CryptoKey
): Promise<{ encrypted: string; iv: string }> {
  // Generate random IV (12 bytes for AES-GCM)
  const iv = crypto.getRandomValues(new Uint8Array(12));

  // Encode content as bytes
  const encodedContent = new TextEncoder().encode(content);

  // Encrypt
  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encodedContent
  );

  return {
    encrypted: arrayBufferToBase64(encryptedBuffer),
    iv: arrayBufferToBase64(iv.buffer)
  };
}

/**
 * Decrypt content with the provided key and IV
 */
export async function decryptContent(
  encrypted: string,
  iv: string,
  key: CryptoKey
): Promise<string> {
  try {
    const encryptedBuffer = base64ToArrayBuffer(encrypted);
    const ivBuffer = base64ToArrayBuffer(iv);

    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: ivBuffer },
      key,
      encryptedBuffer
    );

    return new TextDecoder().decode(decryptedBuffer);
  } catch (error) {
    throw new Error('Failed to decrypt content. Invalid key or corrupted data.');
  }
}

/**
 * Export encryption key to base64 string (for URL fragment)
 */
export async function exportKey(key: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey('raw', key);
  return arrayBufferToBase64(exported);
}

/**
 * Import encryption key from base64 string (from URL fragment)
 */
export async function importKey(keyString: string): Promise<CryptoKey> {
  const keyBuffer = base64ToArrayBuffer(keyString);
  return await crypto.subtle.importKey(
    'raw',
    keyBuffer,
    { name: 'AES-GCM' },
    true,
    ['encrypt', 'decrypt']
  );
}

/**
 * Combine encrypted content and IV into a single string for storage
 */
export function combineEncryptedData(encrypted: string, iv: string): string {
  return `${iv}:${encrypted}`;
}

/**
 * Split combined encrypted data back into IV and encrypted content
 */
export function splitEncryptedData(combined: string): { encrypted: string; iv: string } {
  const [iv, encrypted] = combined.split(':');
  if (!iv || !encrypted) {
    throw new Error('Invalid encrypted data format');
  }
  return { iv, encrypted };
}
