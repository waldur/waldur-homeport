import { describe, expect, it } from 'vitest';

import {
  AttachmentIntegrityError,
  decryptAttachment,
  encryptAttachment,
  EncryptedFile,
  parseEncryptedFile,
} from './attachmentCrypto';

const bytes = (b64: string) =>
  Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
const buffer = (b64: string) => bytes(b64).buffer as ArrayBuffer;
const text = (data: ArrayBuffer) => new TextDecoder().decode(data);
const b64 = (data: ArrayBuffer) =>
  btoa(String.fromCharCode(...new Uint8Array(data)));

// NIST SP 800-38A, F.5.5 (CTR-AES256.Encrypt), with the key as a JWK and the
// counter block as the IV. The hash is the SHA-256 of the ciphertext.
const NIST_FILE: EncryptedFile = {
  url: 'mxc://hs.example/nist',
  key: {
    kty: 'oct',
    alg: 'A256CTR',
    ext: true,
    key_ops: ['encrypt', 'decrypt'],
    k: 'YD3rEBXKcb4rc67whX13gR81LAc7YQjXLZgQowkU3_Q',
  },
  iv: '8PHy8/T19vf4+fr7/P3+/w',
  hashes: { sha256: 'ZjExoH6exWoMfQZrvET9Tu+kuul87rJwH1PSFT6C/6U' },
  v: 'v2',
};
const NIST_PLAINTEXT =
  'a8G+4i5An5bpPX4Rc5MXKq4tilceA6ycnrdvrEWvjlEwyBxGo1zkEeX7wRkaClLv9p8kRd9PmxetK0F75mw3EA==';
const NIST_CIPHERTEXT =
  'YB7DE3dXiaW3p/UEu/PSKPRD48pNYrWayoTpkMrK9cUrCTDaoj3pTOhwF7othJiN38nFjbZ6raYTwt0IRXlBpg==';

describe('decryptAttachment', () => {
  it('decrypts the NIST AES-256-CTR vector', async () => {
    const plaintext = await decryptAttachment(
      buffer(NIST_CIPHERTEXT),
      NIST_FILE,
    );
    expect(b64(plaintext)).toBe(NIST_PLAINTEXT);
  });

  it('refuses ciphertext that does not match the hash', async () => {
    const tampered = bytes(NIST_CIPHERTEXT);
    tampered[0] ^= 1;
    await expect(
      decryptAttachment(tampered.buffer as ArrayBuffer, NIST_FILE),
    ).rejects.toBeInstanceOf(AttachmentIntegrityError);
  });
});

describe('encryptAttachment', () => {
  it('round-trips through decryptAttachment', async () => {
    const plaintext = new TextEncoder().encode('quarterly report').buffer;
    const { ciphertext, file } = await encryptAttachment(plaintext);

    expect(text(ciphertext)).not.toBe('quarterly report');
    const parsed = parseEncryptedFile({ ...file, url: 'mxc://hs/abc' });
    expect(parsed).not.toBeNull();
    expect(text(await decryptAttachment(ciphertext, parsed!))).toBe(
      'quarterly report',
    );
  });

  it('writes the spec format: v2, unpadded base64, a zero counter', async () => {
    const { file } = await encryptAttachment(new ArrayBuffer(3));

    expect(file.v).toBe('v2');
    expect(file.key).toMatchObject({
      kty: 'oct',
      alg: 'A256CTR',
      ext: true,
      key_ops: ['encrypt', 'decrypt'],
    });
    expect(file.key.k).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(file.iv).toMatch(/^[A-Za-z0-9+/]{22}$/);
    expect(file.hashes.sha256).toMatch(/^[A-Za-z0-9+/]{43}$/);
    const iv = bytes(file.iv + '==');
    expect(Array.from(iv.slice(8))).toEqual([0, 0, 0, 0, 0, 0, 0, 0]);
  });

  it('uses a fresh key and IV for every file', async () => {
    const a = await encryptAttachment(new ArrayBuffer(16));
    const b = await encryptAttachment(new ArrayBuffer(16));
    expect(a.file.key.k).not.toBe(b.file.key.k);
    expect(a.file.iv).not.toBe(b.file.iv);
  });
});

describe('parseEncryptedFile', () => {
  it('accepts a well-formed file and keeps only the known fields', () => {
    const parsed = parseEncryptedFile({
      ...NIST_FILE,
      mimetype: 'text/html',
      key: { ...NIST_FILE.key, extra: 'x' },
    });
    expect(parsed).toEqual(NIST_FILE);
  });

  it('accepts a padded key, as some clients send', () => {
    expect(
      parseEncryptedFile({
        ...NIST_FILE,
        key: { ...NIST_FILE.key, k: NIST_FILE.key.k + '=' },
      }),
    ).not.toBeNull();
  });

  it.each([
    ['not an object', 'nope'],
    ['no key', { ...NIST_FILE, key: undefined }],
    ['no hashes', { ...NIST_FILE, hashes: undefined }],
    ['an https url', { ...NIST_FILE, url: 'https://evil.example/x' }],
    ['a url without media id', { ...NIST_FILE, url: 'mxc://hs.example/' }],
    ['a parent-directory url', { ...NIST_FILE, url: 'mxc://../config' }],
    ['a nested url', { ...NIST_FILE, url: 'mxc://hs.example/a/b' }],
    ['version v1', { ...NIST_FILE, v: 'v1' }],
    ['no version', { ...NIST_FILE, v: undefined }],
    [
      'another algorithm',
      { ...NIST_FILE, key: { ...NIST_FILE.key, alg: 'A128CTR' } },
    ],
    [
      'another key type',
      { ...NIST_FILE, key: { ...NIST_FILE.key, kty: 'RSA' } },
    ],
    [
      'no decrypt op',
      { ...NIST_FILE, key: { ...NIST_FILE.key, key_ops: ['encrypt'] } },
    ],
    [
      'a 128-bit key',
      { ...NIST_FILE, key: { ...NIST_FILE.key, k: 'AAAAAAAAAAAAAAAAAAAAAA' } },
    ],
    [
      'a key in standard base64',
      {
        ...NIST_FILE,
        key: { ...NIST_FILE.key, k: NIST_FILE.key.k.replace('_', '/') },
      },
    ],
    ['a short IV', { ...NIST_FILE, iv: 'AAAAAAAAAAA' }],
    ['an IV with whitespace', { ...NIST_FILE, iv: ' ' + NIST_FILE.iv }],
    ['a short hash', { ...NIST_FILE, hashes: { sha256: 'AAAA' } }],
    ['a numeric hash', { ...NIST_FILE, hashes: { sha256: 42 } }],
  ])('rejects %s', (_, raw) => {
    expect(parseEncryptedFile(raw)).toBeNull();
  });
});
