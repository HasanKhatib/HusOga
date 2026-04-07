import * as Crypto from 'expo-crypto';

function toHex(b: number): string {
  return b.toString(16).padStart(2, '0');
}

/**
 * UUID v4 using Expo Crypto random bytes.
 * Avoids relying on crypto.getRandomValues (missing in some Expo Go environments).
 */
export async function uuidv4(): Promise<string> {
  const bytes = Crypto.getRandomBytes(16);
  // Per RFC 4122 section 4.4
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = Array.from(bytes, toHex);
  return (
    hex.slice(0, 4).join('') +
    '-' +
    hex.slice(4, 6).join('') +
    '-' +
    hex.slice(6, 8).join('') +
    '-' +
    hex.slice(8, 10).join('') +
    '-' +
    hex.slice(10, 16).join('')
  );
}
