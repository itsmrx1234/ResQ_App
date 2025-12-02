import crypto from 'crypto';
import * as SecureStore from 'expo-secure-store';
import { encryptBytes, decryptBytes, loadOrCreateKey } from '../utils/encryption';

describe('expo encryption helpers', () => {
  beforeEach(() => {
    jest.spyOn(SecureStore, 'getItemAsync').mockResolvedValue(null);
    jest.spyOn(SecureStore, 'setItemAsync').mockResolvedValue();
    process.env.RESQAPP_ENCRYPTION_KEY = crypto.randomBytes(32).toString('base64');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('persists a key in secure store', async () => {
    const setSpy = jest.spyOn(SecureStore, 'setItemAsync');
    const key = await loadOrCreateKey();
    expect(key).toBeInstanceOf(Buffer);
    expect(setSpy).toHaveBeenCalled();
  });

  it('round-trips payloads', async () => {
    const payload = await encryptBytes(Buffer.from('expo secret'));
    const { plaintext, migrated } = await decryptBytes(payload);
    expect(plaintext.toString()).toBe('expo secret');
    expect(migrated).toBe(false);
  });

  it('migrates from legacy key if provided', async () => {
    const legacyKey = crypto.randomBytes(32);
    process.env.LEGACY_ENCRYPTION_KEY = legacyKey.toString('base64');
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', legacyKey, iv);
    const ciphertext = Buffer.concat([cipher.update('legacy expo'), cipher.final()]);
    const tag = cipher.getAuthTag();

    const result = await decryptBytes({
      ciphertext,
      iv: iv.toString('base64'),
      tag: tag.toString('base64'),
      algorithm: 'aes-256-gcm',
      keyVersion: 'legacy',
    });
    expect(result.plaintext.toString()).toBe('legacy expo');
    expect(result.migrated).toBe(true);
  });
});
