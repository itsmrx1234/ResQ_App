import { encryptBytes, decryptBytes, loadOrCreateKey } from '../utils/crypto';
import * as Keychain from 'react-native-keychain';
import crypto from 'crypto';

describe('crypto helpers', () => {
  beforeEach(() => {
    jest.spyOn(Keychain, 'getGenericPassword').mockResolvedValue(null);
    jest.spyOn(Keychain, 'setGenericPassword').mockResolvedValue(true);
    process.env.RESQAPP_ENCRYPTION_KEY = crypto.randomBytes(32).toString('base64');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('loads or generates a key and caches it in keychain', async () => {
    const setSpy = jest.spyOn(Keychain, 'setGenericPassword');
    const key = await loadOrCreateKey();
    expect(key).toBeInstanceOf(Buffer);
    expect(setSpy).toHaveBeenCalled();
  });

  it('encrypts and decrypts buffers', async () => {
    const data = Buffer.from('secret data');
    const payload = await encryptBytes(data);
    const { plaintext, migrated } = await decryptBytes(payload);
    expect(plaintext.toString()).toBe('secret data');
    expect(migrated).toBe(false);
  });

  it('re-encrypts legacy payloads', async () => {
    const legacyKey = crypto.randomBytes(32);
    process.env.LEGACY_ENCRYPTION_KEY = legacyKey.toString('base64');
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', legacyKey, iv);
    const ciphertext = Buffer.concat([cipher.update('old secret'), cipher.final()]);
    const tag = cipher.getAuthTag();
    const payload = { ciphertext, iv: iv.toString('base64'), tag: tag.toString('base64'), algorithm: 'aes-256-gcm' };

    const result = await decryptBytes(payload);
    expect(result.plaintext.toString()).toBe('old secret');
    expect(result.migrated).toBe(true);
    expect(result.payload).toHaveProperty('ciphertext');
  });
});
