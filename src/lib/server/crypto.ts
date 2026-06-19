import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';
import { env } from '$env/dynamic/private';

// AES-256-GCM encryption for GitHub access tokens at rest.
// The 32-byte key is derived from SESSION_SECRET via SHA-256 so any
// length of secret yields a valid key.

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96-bit nonce recommended for GCM

function getKey(): Buffer {
	const secret = env.SESSION_SECRET;
	if (!secret) {
		throw new Error('SESSION_SECRET is not set — cannot encrypt/decrypt tokens.');
	}
	return createHash('sha256').update(secret).digest();
}

/**
 * Encrypts a plaintext string. Returns a compact `iv:authTag:ciphertext`
 * base64 payload safe to store in a single DB column.
 */
export function encrypt(plaintext: string): string {
	const iv = randomBytes(IV_LENGTH);
	const cipher = createCipheriv(ALGORITHM, getKey(), iv);
	const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
	const authTag = cipher.getAuthTag();
	return [iv.toString('base64'), authTag.toString('base64'), ciphertext.toString('base64')].join(
		':'
	);
}

/**
 * Decrypts a payload produced by {@link encrypt}. Throws if the payload is
 * malformed or tampered with.
 */
export function decrypt(payload: string): string {
	const parts = payload.split(':');
	if (parts.length !== 3) {
		throw new Error('Malformed encrypted payload.');
	}
	const [ivB64, tagB64, dataB64] = parts;
	const iv = Buffer.from(ivB64, 'base64');
	const authTag = Buffer.from(tagB64, 'base64');
	const data = Buffer.from(dataB64, 'base64');
	const decipher = createDecipheriv(ALGORITHM, getKey(), iv);
	decipher.setAuthTag(authTag);
	return Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8');
}
