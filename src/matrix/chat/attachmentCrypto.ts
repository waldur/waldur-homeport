import { parseMxcUrl } from './mxc';

// Attachments in an encrypted room, as the Matrix spec's "Sending encrypted
// attachments" defines them: AES-CTR with a 256-bit key and a 64-bit block
// counter, the key sent as a JWK inside the (encrypted) event, and the SHA-256
// of the ciphertext so a receiver can tell the stored file was not swapped.
// The homeserver only ever holds the ciphertext.

const KEY_BYTES = 32;
const IV_BYTES = 16;
const SHA256_BYTES = 32;

/** The `file` object of an encrypted media event (EncryptedFile in the spec). */
export interface EncryptedFile {
  url: string;
  key: {
    kty: 'oct';
    alg: 'A256CTR';
    ext: true;
    key_ops: string[];
    k: string;
  };
  iv: string;
  hashes: { sha256: string };
  v: 'v2';
}

/** Raised when the downloaded ciphertext is not the one the sender hashed. */
export class AttachmentIntegrityError extends Error {
  constructor() {
    super('Attachment hash mismatch');
    this.name = 'AttachmentIntegrityError';
  }
}

const toBase64 = (bytes: Uint8Array) => {
  let latin1 = '';
  for (const byte of bytes) latin1 += String.fromCharCode(byte);
  return btoa(latin1).replace(/=+$/, '');
};

const toBase64Url = (bytes: Uint8Array) =>
  toBase64(bytes).replace(/\+/g, '-').replace(/\//g, '_');

// Strict on purpose: these strings come from other people's events, and atob
// alone skips whitespace and accepts lengths the spec's unpadded form can't have.
const fromBase64 = (value: unknown, urlSafe: boolean): Uint8Array | null => {
  if (typeof value !== 'string') return null;
  const alphabet = urlSafe
    ? /^[A-Za-z0-9_-]*={0,2}$/
    : /^[A-Za-z0-9+/]*={0,2}$/;
  if (!alphabet.test(value)) return null;
  let unpadded = value.replace(/=+$/, '');
  if (unpadded.length % 4 === 1) return null;
  if (urlSafe) unpadded = unpadded.replace(/-/g, '+').replace(/_/g, '/');
  try {
    const latin1 = atob(unpadded + '='.repeat((4 - (unpadded.length % 4)) % 4));
    return Uint8Array.from(latin1, (c) => c.charCodeAt(0));
  } catch {
    return null;
  }
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/**
 * Validate the `file` object of an event before any of it is used: the event
 * is written by whoever sent it. Returns a fresh object holding only the
 * checked fields, or null if anything is missing or malformed.
 */
export function parseEncryptedFile(raw: unknown): EncryptedFile | null {
  if (!isRecord(raw) || !isRecord(raw.key) || !isRecord(raw.hashes)) {
    return null;
  }
  const { url, key, iv, hashes, v } = raw;
  if (v !== 'v2') return null;
  if (typeof url !== 'string' || !parseMxcUrl(url)) return null;
  if (key.kty !== 'oct' || key.alg !== 'A256CTR') return null;
  if (!Array.isArray(key.key_ops) || !key.key_ops.includes('decrypt')) {
    return null;
  }
  if (fromBase64(key.k, true)?.length !== KEY_BYTES) return null;
  if (fromBase64(iv, false)?.length !== IV_BYTES) return null;
  if (fromBase64(hashes.sha256, false)?.length !== SHA256_BYTES) return null;
  return {
    url,
    key: {
      kty: 'oct',
      alg: 'A256CTR',
      ext: true,
      key_ops: ['encrypt', 'decrypt'],
      k: key.k as string,
    },
    iv: iv as string,
    hashes: { sha256: hashes.sha256 as string },
    v: 'v2',
  };
}

const importKey = (raw: Uint8Array<ArrayBuffer>) =>
  crypto.subtle.importKey('raw', raw, { name: 'AES-CTR' }, false, [
    'encrypt',
    'decrypt',
  ]);

/**
 * Encrypt a file for upload. The returned `file` lacks only the `url`, which
 * the upload of `ciphertext` yields.
 */
export async function encryptAttachment(plaintext: ArrayBuffer): Promise<{
  ciphertext: ArrayBuffer;
  file: Omit<EncryptedFile, 'url'>;
}> {
  const rawKey = crypto.getRandomValues(new Uint8Array(KEY_BYTES));
  // The high 64 bits are a random nonce; the low 64 bits are the block
  // counter, which starts at zero so it cannot wrap within one file.
  const iv = new Uint8Array(IV_BYTES);
  crypto.getRandomValues(iv.subarray(0, 8));
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-CTR', counter: iv, length: 64 },
    await importKey(rawKey),
    plaintext,
  );
  const digest = await crypto.subtle.digest('SHA-256', ciphertext);
  return {
    ciphertext,
    file: {
      key: {
        kty: 'oct',
        alg: 'A256CTR',
        ext: true,
        key_ops: ['encrypt', 'decrypt'],
        k: toBase64Url(rawKey),
      },
      iv: toBase64(iv),
      hashes: { sha256: toBase64(new Uint8Array(digest)) },
      v: 'v2',
    },
  };
}

/**
 * Decrypt a downloaded attachment. The hash is checked first, so nothing is
 * decrypted from a file other than the one the sender uploaded.
 */
export async function decryptAttachment(
  ciphertext: ArrayBuffer,
  file: EncryptedFile,
): Promise<ArrayBuffer> {
  const expected = fromBase64(file.hashes.sha256, false);
  const actual = new Uint8Array(
    await crypto.subtle.digest('SHA-256', ciphertext),
  );
  if (
    !expected ||
    expected.length !== actual.length ||
    expected.some((byte, i) => byte !== actual[i])
  ) {
    throw new AttachmentIntegrityError();
  }
  const rawKey = fromBase64(file.key.k, true);
  const iv = fromBase64(file.iv, false);
  if (rawKey?.length !== KEY_BYTES || iv?.length !== IV_BYTES) {
    throw new Error('Malformed attachment key');
  }
  return crypto.subtle.decrypt(
    { name: 'AES-CTR', counter: iv as Uint8Array<ArrayBuffer>, length: 64 },
    await importKey(rawKey as Uint8Array<ArrayBuffer>),
    ciphertext,
  );
}
