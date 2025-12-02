import { Buffer } from 'buffer';
import { sha256 } from '@noble/hashes/sha256';
import { aes256gcm } from '@noble/ciphers/aes';
import * as Random from 'expo-random';
import * as SecureStore from 'expo-secure-store';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 12;
const TAG_LENGTH = 16;
const KEY_ID = 'resqapp.expo.encryption';
const LEGACY_KEY = process.env.LEGACY_ENCRYPTION_KEY || 'ENCRYPTION_KEY';

const normalizeKey = (rawKey?: string | Buffer | null) => {
  if (!rawKey) return null;
  const buffer = Buffer.isBuffer(rawKey) ? rawKey : Buffer.from(rawKey, 'base64');
  if (buffer.length === KEY_LENGTH) return buffer;
  const hash = sha256(buffer);
  return Buffer.from(hash.subarray(0, KEY_LENGTH));
};

export const loadOrCreateKey = async (): Promise<Buffer> => {
  const stored = await SecureStore.getItemAsync(KEY_ID);
  if (stored) {
    return Buffer.from(stored, 'base64');
  }
  const envKey = process.env.RESQAPP_ENCRYPTION_KEY;
  const key =
    normalizeKey(envKey) || Buffer.from(await Random.getRandomBytesAsync(KEY_LENGTH));
  await SecureStore.setItemAsync(KEY_ID, key.toString('base64'));
  return key;
};

const legacyKey = () => normalizeKey(LEGACY_KEY);

export type CipherPayload = {
  ciphertext: Buffer;
  iv: string;
  tag: string;
  algorithm: string;
  keyVersion: string;
};

export const encryptBytes = async (buffer: Buffer): Promise<CipherPayload> => {
  const key = await loadOrCreateKey();
  const iv = Buffer.from(await Random.getRandomBytesAsync(IV_LENGTH));
  const cipher = aes256gcm(key, iv);
  const ciphertextWithTag = Buffer.from(cipher.encrypt(buffer));
  const ciphertext = ciphertextWithTag.subarray(0, ciphertextWithTag.length - TAG_LENGTH);
  const tag = ciphertextWithTag.subarray(ciphertextWithTag.length - TAG_LENGTH);
  return {
    ciphertext,
    iv: iv.toString('base64'),
    tag: tag.toString('base64'),
    algorithm: ALGORITHM,
    keyVersion: 'secure',
  };
};

export const decryptBytes = async (
  payload: CipherPayload,
): Promise<{ plaintext: Buffer; migrated: boolean; payload: CipherPayload }> => {
  if (payload.algorithm !== ALGORITHM) {
    throw new Error('Unsupported algorithm');
  }
  const key = await loadOrCreateKey();
  const iv = Buffer.from(payload.iv, 'base64');
  const tag = Buffer.from(payload.tag, 'base64');
  const attempt = (candidate: Buffer) => {
    const decipher = aes256gcm(candidate, iv);
    const combined = Buffer.concat([payload.ciphertext, tag]);
    const plaintext = decipher.decrypt(combined);
    if (!plaintext) {
      throw new Error('Decryption failed');
    }
    return Buffer.from(plaintext);
  };

  try {
    const plaintext = attempt(key);
    return { plaintext, migrated: false, payload };
  } catch (error) {
    const fallback = legacyKey();
    if (!fallback) {
      throw error;
    }
    const plaintext = attempt(fallback);
    const rotated = await encryptBytes(plaintext);
    return { plaintext, migrated: true, payload: rotated };
  }
};

export const encryptBlob = async (blob: Blob) => {
  const arrayBuffer = await blob.arrayBuffer();
  const { ciphertext, iv, tag, algorithm, keyVersion } = await encryptBytes(Buffer.from(arrayBuffer));
  return {
    blob: new Blob([ciphertext], { type: 'application/octet-stream' }),
    iv,
    tag,
    algorithm,
    keyVersion,
  };
};

export const decryptToBlob = async (payload: CipherPayload) => {
  const { plaintext, migrated, payload: rotated } = await decryptBytes(payload);
  return {
    blob: new Blob([plaintext], { type: 'application/octet-stream' }),
    migrated,
    rotated,
  };
};
