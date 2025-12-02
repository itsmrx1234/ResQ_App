import { Buffer } from 'buffer';
import crypto from 'crypto';
import * as Keychain from 'react-native-keychain';

const KEY_SERVICE = 'resqapp.encryption';
const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 12;
const LEGACY_KEY = process.env.LEGACY_ENCRYPTION_KEY || 'ENCRYPTION_KEY';

const normalizeKey = (rawKey) => {
  if (!rawKey) {
    return null;
  }
  const buffer = Buffer.isBuffer(rawKey) ? rawKey : Buffer.from(rawKey, 'base64');
  if (buffer.length === KEY_LENGTH) {
    return buffer;
  }
  const hash = crypto.createHash('sha256').update(buffer).digest();
  return hash.subarray(0, KEY_LENGTH);
};

export const loadOrCreateKey = async () => {
  const stored = await Keychain.getGenericPassword({ service: KEY_SERVICE });
  if (stored?.password) {
    return Buffer.from(stored.password, 'base64');
  }

  const envKey = process.env.RESQAPP_ENCRYPTION_KEY;
  const keyBuffer = normalizeKey(envKey) || crypto.randomBytes(KEY_LENGTH);
  await Keychain.setGenericPassword(KEY_SERVICE, keyBuffer.toString('base64'), {
    service: KEY_SERVICE,
    accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
  });
  return keyBuffer;
};

const legacyKeyBuffer = () => normalizeKey(LEGACY_KEY);

const buildCipherPayload = (ciphertext, iv, authTag) => ({
  ciphertext,
  iv: iv.toString('base64'),
  tag: authTag.toString('base64'),
  algorithm: ALGORITHM,
  keyVersion: 'secure',
});

export const encryptBytes = async (buffer) => {
  const key = await loadOrCreateKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
  const tag = cipher.getAuthTag();
  return buildCipherPayload(encrypted, iv, tag);
};

export const decryptBytes = async (payload) => {
  const { ciphertext, iv, tag, algorithm } = payload;
  if (algorithm !== ALGORITHM) {
    throw new Error('Unsupported algorithm');
  }
  const newKey = await loadOrCreateKey();
  const ivBuffer = Buffer.from(iv, 'base64');
  const tagBuffer = Buffer.from(tag, 'base64');

  const tryDecrypt = (key) => {
    const decipher = crypto.createDecipheriv(ALGORITHM, key, ivBuffer);
    decipher.setAuthTag(tagBuffer);
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  };

  try {
    const plaintext = tryDecrypt(newKey);
    return { plaintext, migrated: false, payload };
  } catch (err) {
    const legacy = legacyKeyBuffer();
    if (!legacy) {
      throw err;
    }
    try {
      const plaintext = tryDecrypt(legacy);
      const reEncrypted = await encryptBytes(plaintext);
      return { plaintext, migrated: true, payload: reEncrypted };
    } catch (inner) {
      throw err;
    }
  }
};

export const encryptBlob = async (blob) => {
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

export const decryptToBlob = async (payload) => {
  const { plaintext, migrated, payload: rotated } = await decryptBytes(payload);
  return {
    blob: new Blob([plaintext], { type: 'application/octet-stream' }),
    migrated,
    rotated,
  };
};
