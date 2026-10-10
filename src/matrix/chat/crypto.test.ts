import { captureMessage } from '@sentry/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  matrixCryptoEscrow,
  matrixCryptoLease,
  matrixCryptoLeaseRelease,
} from 'waldur-js-client';

import {
  CryptoConflict,
  importRecoveryKey,
  resetEncryption,
  SecretStorageKeyHolder,
  setUpEncryption,
  startCrypto,
  WrongRecoveryKey,
} from './crypto';

vi.mock('@sentry/react', () => ({ captureMessage: vi.fn() }));

class OnlySignedDevicesIsolationMode {}

vi.mock('matrix-js-sdk/lib/crypto-api', () => ({
  OnlySignedDevicesIsolationMode,
  decodeRecoveryKey: (key: string) => {
    if (key.startsWith('bad')) throw new Error('Incorrect parity');
    return new TextEncoder().encode(key);
  },
  encodeRecoveryKey: (key: Uint8Array) =>
    `canonical:${new TextDecoder().decode(key)}`,
}));

const leaseMock = vi.mocked(matrixCryptoLease);
const escrowMock = vi.mocked(matrixCryptoEscrow);
const releaseMock = vi.mocked(matrixCryptoLeaseRelease);

const KEY = 'EsSz ykH7 LCZx 7Cae';
const GENERATED = {
  privateKey: new Uint8Array([1, 2, 3]),
  encodedPrivateKey: KEY,
};

/** A mock returning a promise of what `fn` returns, for fakes with no await. */
const resolved = <T>(fn: (...args: any[]) => T) =>
  vi.fn((...args: any[]) => Promise.resolve(fn(...args)));

/** A fake client whose crypto calls are recorded in order. */
const makeClient = (
  options: { identity?: boolean; keyOpens?: boolean } = {},
) => {
  const calls: string[] = [];
  const record = (name: string) => () => {
    calls.push(name);
  };
  const crypto = {
    setDeviceIsolationMode: vi.fn(),
    userHasCrossSigningKeys: resolved(() => {
      calls.push('userHasCrossSigningKeys');
      return options.identity ?? false;
    }),
    createRecoveryKeyFromPassphrase: resolved(() => {
      calls.push('createRecoveryKey');
      return GENERATED;
    }),
    bootstrapSecretStorage: vi.fn(async (opts: any) => {
      calls.push('bootstrapSecretStorage:start');
      if (opts.createSecretStorageKey) await opts.createSecretStorageKey();
      calls.push('bootstrapSecretStorage:write');
    }),
    bootstrapCrossSigning: vi.fn(async (opts: any) => {
      calls.push('bootstrapCrossSigning');
      await opts.authUploadDeviceSigningKeys?.(() => Promise.resolve());
    }),
    resetEncryption: vi.fn(async (auth: any) => {
      calls.push('resetEncryption');
      await auth((authData: any) => {
        calls.push(`upload:${authData?.type ?? 'none'}`);
        return authData
          ? Promise.resolve()
          : Promise.reject({
              httpStatus: 401,
              data: { session: 'uia-1', flows: [] },
            });
      });
    }),
    getDeviceVerificationStatus: resolved(() => ({ signedByOwner: false })),
    crossSignDevice: resolved(record('crossSignDevice')),
    loadSessionBackupPrivateKeyFromSecretStorage: resolved(
      record('loadBackupKey'),
    ),
    checkKeyBackupAndEnable: resolved(() => {
      calls.push('enableBackup');
      return null;
    }),
    restoreKeyBackup: resolved(() => ({ total: 0, imported: 0 })),
    isDehydrationSupported: resolved(() => true),
    startDehydration: resolved((opts: any) => {
      calls.push(`dehydration:${JSON.stringify(opts)}`);
    }),
  };
  const client = {
    calls,
    crypto,
    initRustCrypto: resolved(() => undefined),
    getCrypto: () => crypto,
    getSafeUserId: () => '@alice:example.com',
    getDeviceId: () => 'WALDUR_WEB_A',
    secretStorage: {
      getDefaultKeyId: resolved(() => 'K1'),
      getKey: resolved(() => [
        'K1',
        { algorithm: 'aes', iv: 'iv', mac: 'mac' },
      ]),
      checkKey: resolved(() => options.keyOpens ?? true),
      // Where the dehydration key is stored: under the current key by default.
      isStored: resolved(() => ({ K1: {} })),
    },
  };
  return client as any;
};

describe('chat encryption', () => {
  beforeEach(() => {
    releaseMock.mockResolvedValue({} as any);
    leaseMock.mockResolvedValue({
      data: { lease: 'lease-1', expires_at: '', temporary_password: null },
    } as any);
    escrowMock.mockImplementation(() => {
      return Promise.resolve({} as any);
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('starts rust crypto in memory and only trusts cross-signed devices', async () => {
    const client = makeClient();

    await startCrypto(client);

    expect(client.initRustCrypto).toHaveBeenCalledWith({ useIndexedDB: false });
    expect(client.crypto.setDeviceIsolationMode).toHaveBeenCalledWith(
      expect.any(OnlySignedDevicesIsolationMode),
    );
  });

  it('sets up a new user with secret storage first, escrowing before any upload', async () => {
    const client = makeClient({ identity: false });
    escrowMock.mockImplementation(() => {
      client.calls.push('escrow');
      return Promise.resolve({} as any);
    });
    const holder = new SecretStorageKeyHolder();

    const state = await setUpEncryption(client, { recovery_key: null }, holder);

    expect(state).toBe('ready');
    expect(leaseMock).toHaveBeenCalledWith({ body: { kind: 'bootstrap' } });
    expect(escrowMock).toHaveBeenCalledWith({
      body: { lease: 'lease-1', recovery_key: KEY },
    });
    expect(client.calls).toEqual([
      'userHasCrossSigningKeys',
      'bootstrapSecretStorage:start',
      'createRecoveryKey',
      'escrow',
      'bootstrapSecretStorage:write',
      'bootstrapCrossSigning',
      'dehydration:{"createNewKey":true}',
    ]);
  });

  it('writes nothing when Waldur refuses the escrow', async () => {
    const client = makeClient({ identity: false });
    escrowMock.mockRejectedValue({
      state: 'no_lease',
      response: { status: 409, headers: new Headers() },
    });

    await expect(
      setUpEncryption(
        client,
        { recovery_key: null },
        new SecretStorageKeyHolder(),
      ),
    ).rejects.toEqual(expect.objectContaining({ state: 'no_lease' }));
    expect(client.calls).not.toContain('bootstrapSecretStorage:write');
    expect(client.crypto.bootstrapCrossSigning).not.toHaveBeenCalled();
  });

  it('reports another window holding the lease, with its Retry-After', async () => {
    leaseMock.mockRejectedValue({
      state: 'in_progress',
      response: { status: 409, headers: new Headers({ 'Retry-After': '42' }) },
    });

    const error = await setUpEncryption(
      makeClient({ identity: false }),
      { recovery_key: null },
      new SecretStorageKeyHolder(),
    ).catch((e) => e);

    expect(error).toBeInstanceOf(CryptoConflict);
    expect(error.state).toBe('in_progress');
    expect(error.retryAfterSeconds).toBe(42);
  });

  it('unlocks a later session, downloading the identity before cross-signing', async () => {
    const client = makeClient({ identity: true });
    const holder = new SecretStorageKeyHolder();

    const state = await setUpEncryption(client, { recovery_key: KEY }, holder);

    expect(state).toBe('ready');
    expect(client.crypto.userHasCrossSigningKeys).toHaveBeenCalledWith(
      '@alice:example.com',
      true,
    );
    expect(client.calls).toEqual([
      'userHasCrossSigningKeys',
      'bootstrapCrossSigning',
      // bootstrapCrossSigning can leave the device unsigned; sign it directly.
      'crossSignDevice',
      'loadBackupKey',
      'enableBackup',
      'dehydration:{"rehydrate":true}',
    ]);
    expect(client.crypto.restoreKeyBackup).toHaveBeenCalled();
    expect(leaseMock).not.toHaveBeenCalled();
    // The key reaches matrix-js-sdk through the crypto callbacks.
    expect(
      await holder.callbacks.getSecretStorageKey({ keys: { K1: {} } }),
    ).toEqual(['K1', new TextEncoder().encode(KEY)]);
  });

  it('is locked when the homeserver has an identity and Waldur holds no key', async () => {
    const client = makeClient({ identity: true });

    expect(
      await setUpEncryption(
        client,
        { recovery_key: null },
        new SecretStorageKeyHolder(),
      ),
    ).toBe('locked');
    expect(client.crypto.bootstrapCrossSigning).not.toHaveBeenCalled();
  });

  it("is locked when Waldur's key doesn't open secret storage", async () => {
    const client = makeClient({ identity: true, keyOpens: false });

    expect(
      await setUpEncryption(
        client,
        { recovery_key: KEY },
        new SecretStorageKeyHolder(),
      ),
    ).toBe('locked');
    expect(client.crypto.bootstrapCrossSigning).not.toHaveBeenCalled();
  });

  it('resets with the temporary password, then escrows new secret storage', async () => {
    leaseMock.mockResolvedValue({
      data: { lease: 'lease-2', expires_at: '', temporary_password: 'tmp-pw' },
    } as any);
    const client = makeClient({ identity: true });
    escrowMock.mockImplementation(() => {
      client.calls.push('escrow');
      return Promise.resolve({} as any);
    });

    await resetEncryption(client, new SecretStorageKeyHolder());

    expect(leaseMock).toHaveBeenCalledWith({ body: { kind: 'reset' } });
    expect(client.calls).toEqual([
      'resetEncryption',
      'upload:none',
      'upload:m.login.password',
      'bootstrapSecretStorage:start',
      'createRecoveryKey',
      'escrow',
      'bootstrapSecretStorage:write',
      'dehydration:{"createNewKey":true}',
    ]);
  });

  it('releases the lease once the setup is done, and when it fails', async () => {
    await setUpEncryption(
      makeClient({ identity: false }),
      { recovery_key: null },
      new SecretStorageKeyHolder(),
    );
    expect(releaseMock).toHaveBeenCalledWith({ body: { lease: 'lease-1' } });

    releaseMock.mockClear();
    escrowMock.mockRejectedValue(new Error('network'));
    await expect(
      setUpEncryption(
        makeClient({ identity: false }),
        { recovery_key: null },
        new SecretStorageKeyHolder(),
      ),
    ).rejects.toThrow('network');
    expect(releaseMock).toHaveBeenCalledWith({ body: { lease: 'lease-1' } });
  });

  it('treats a key description without a MAC as not unlocked', async () => {
    const client = makeClient({ identity: true });
    client.secretStorage.getKey = vi.fn(() =>
      Promise.resolve(['K1', { algorithm: 'aes' }]),
    );

    expect(
      await setUpEncryption(
        client,
        { recovery_key: KEY },
        new SecretStorageKeyHolder(),
      ),
    ).toBe('locked');
    expect(client.secretStorage.checkKey).not.toHaveBeenCalled();
  });

  it('escrows a key from another client once it opens secret storage, then unlocks', async () => {
    const client = makeClient({ identity: true });
    escrowMock.mockImplementation(() => {
      client.calls.push('escrow');
      return Promise.resolve({} as any);
    });
    const holder = new SecretStorageKeyHolder();

    await importRecoveryKey(client, holder, ' EsSz ykH7\nLCZx 7Cae ');

    expect(client.secretStorage.checkKey).toHaveBeenCalledWith(
      new TextEncoder().encode('EsSzykH7LCZx7Cae'),
      expect.anything(),
    );
    expect(leaseMock).toHaveBeenCalledWith({ body: { kind: 'import' } });
    expect(escrowMock).toHaveBeenCalledWith({
      body: { lease: 'lease-1', recovery_key: 'canonical:EsSzykH7LCZx7Cae' },
    });
    expect(releaseMock).toHaveBeenCalledWith({ body: { lease: 'lease-1' } });
    // Escrowed first, then the session signs itself in with the key; nothing
    // is replaced on the homeserver.
    expect(client.calls).toEqual([
      'escrow',
      'bootstrapCrossSigning',
      'crossSignDevice',
      'loadBackupKey',
      'enableBackup',
      'dehydration:{"rehydrate":true}',
    ]);
    expect(
      await holder.callbacks.getSecretStorageKey({ keys: { K1: {} } }),
    ).toEqual(['K1', new TextEncoder().encode('EsSzykH7LCZx7Cae')]);
  });

  it('sends a key that does not open secret storage nowhere', async () => {
    const client = makeClient({ identity: true, keyOpens: false });

    await expect(
      importRecoveryKey(client, new SecretStorageKeyHolder(), KEY),
    ).rejects.toBeInstanceOf(WrongRecoveryKey);
    expect(leaseMock).not.toHaveBeenCalled();
    expect(escrowMock).not.toHaveBeenCalled();
  });

  it('refuses text that is not a recovery key before anything else', async () => {
    const client = makeClient({ identity: true });

    await expect(
      importRecoveryKey(client, new SecretStorageKeyHolder(), 'bad key'),
    ).rejects.toBeInstanceOf(WrongRecoveryKey);
    expect(client.secretStorage.checkKey).not.toHaveBeenCalled();
    expect(leaseMock).not.toHaveBeenCalled();
  });

  it('does not unlock with a key Waldur refused, and releases the lease', async () => {
    const client = makeClient({ identity: true });
    escrowMock.mockRejectedValue({
      state: 'wrong_key',
      response: { status: 409, headers: new Headers() },
    });

    const error = await importRecoveryKey(
      client,
      new SecretStorageKeyHolder(),
      KEY,
    ).catch((e) => e);

    expect(error).toBeInstanceOf(CryptoConflict);
    expect(error.state).toBe('wrong_key');
    expect(releaseMock).toHaveBeenCalledWith({ body: { lease: 'lease-1' } });
    expect(client.crypto.bootstrapCrossSigning).not.toHaveBeenCalled();
  });

  it('starts dehydration afresh when another app left its key under an old secret-storage key', async () => {
    const client = makeClient({ identity: true });
    client.secretStorage.isStored = resolved(() => ({ OLD: {} }));

    await importRecoveryKey(client, new SecretStorageKeyHolder(), KEY);

    expect(client.crypto.startDehydration).toHaveBeenCalledWith({
      createNewKey: true,
      rehydrate: false,
    });
  });

  it("starts dehydration afresh after Element's identity reset blanked the old key", async () => {
    // Element's reset leaves the dehydration key encrypted under the old key
    // but empties that key's description, so isStored finds nothing usable.
    const client = makeClient({ identity: true });
    client.secretStorage.isStored = resolved(() => null);

    await importRecoveryKey(client, new SecretStorageKeyHolder(), KEY);

    expect(client.crypto.startDehydration).toHaveBeenCalledWith({
      createNewKey: true,
      rehydrate: false,
    });
  });

  it('rehydrates with a dehydration key stored under the current key', async () => {
    const client = makeClient({ identity: true });

    await setUpEncryption(
      client,
      { recovery_key: KEY },
      new SecretStorageKeyHolder(),
    );

    expect(client.crypto.startDehydration).toHaveBeenCalledWith({
      rehydrate: true,
    });
  });

  it('unlocks even when dehydration fails', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const failing = () => {
      const client = makeClient({ identity: true });
      client.crypto.startDehydration = vi.fn(() =>
        Promise.reject(
          new Error('getSecretStorageKey callback returned falsey'),
        ),
      );
      return client;
    };

    // An import, once the key is escrowed...
    await expect(
      importRecoveryKey(failing(), new SecretStorageKeyHolder(), KEY),
    ).resolves.toBeUndefined();
    expect(escrowMock).toHaveBeenCalled();
    // ...and the next session, unlocking with the escrowed key.
    expect(
      await setUpEncryption(
        failing(),
        { recovery_key: KEY },
        new SecretStorageKeyHolder(),
      ),
    ).toBe('ready');
    expect(warn).toHaveBeenCalled();
    // Reported, without the error's own text.
    expect(captureMessage).toHaveBeenCalledWith(
      'Matrix chat could not start device dehydration',
      expect.objectContaining({ extra: { error: 'Error' } }),
    );
    expect(JSON.stringify(vi.mocked(captureMessage).mock.calls)).not.toContain(
      'falsey',
    );
    warn.mockRestore();
  });

  it('reports a key Waldur already holds as not locked', async () => {
    leaseMock.mockRejectedValue({
      state: 'not_locked',
      detail: 'Encryption can be unlocked; no reset.',
      status: 409,
      response: { status: 409, headers: new Headers() },
    });

    const error = await importRecoveryKey(
      makeClient({ identity: true }),
      new SecretStorageKeyHolder(),
      KEY,
    ).catch((e) => e);

    expect(error).toBeInstanceOf(CryptoConflict);
    expect(error.state).toBe('not_locked');
  });

  it('answers only for the key id it was bound to', async () => {
    const holder = new SecretStorageKeyHolder();
    holder.set(new Uint8Array([1]), 'K1');

    expect(
      await holder.callbacks.getSecretStorageKey({ keys: { EVIL: {} } }),
    ).toBeNull();
    expect(
      await holder.callbacks.getSecretStorageKey({ keys: { K1: {} } }),
    ).toEqual(['K1', new Uint8Array([1])]);
  });
});
