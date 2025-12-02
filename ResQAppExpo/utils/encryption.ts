import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = 'resq_app_secure_key_2024';

export const encryptText = (plainText: string): string => {
  if (typeof plainText !== 'string') {
    return '';
  }
  return CryptoJS.AES.encrypt(plainText, ENCRYPTION_KEY).toString();
};

export const decryptText = (cipherText?: string | null): string | null => {
  try {
    const bytes = CryptoJS.AES.decrypt(cipherText || '', ENCRYPTION_KEY);
    const decoded = bytes.toString(CryptoJS.enc.Utf8);
    return decoded || null;
  } catch (err) {
    return null;
  }
};

export const encryptArrayBuffer = (buffer?: ArrayBuffer): string => {
  if (!buffer) return '';
  const wordArray = CryptoJS.lib.WordArray.create(buffer as any);
  const base64Payload = CryptoJS.enc.Base64.stringify(wordArray);
  return encryptText(base64Payload);
};
