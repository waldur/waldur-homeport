import type { MatrixClient } from 'matrix-js-sdk';
import type { GeneratedSecretStorageKey } from 'matrix-js-sdk/lib/crypto-api';
import type { UIAuthCallback } from 'matrix-js-sdk/lib/interactive-auth';
import {
  MatrixSession,
  matrixCryptoEscrow,
  matrixCryptoLease,
  matrixCryptoLeaseRelease,
} from 'waldur-js-client';

/**
 * End-to-end encryption for the chat drawer.
 *
 * Crypto runs in memory only: every web session is a new device, and nothing
 * crypto-related is kept in the browser. What carries over between sessions is
 * on the homeserver (cross-signing identity, secret storage, key backup, a
 * dehydrated device) and is unlocked by the user's recovery key, which Waldur
 * escrows and hands back in each session.
 *
 * Tuwunel accepts a user's first cross-signing keys without a password but
 * refuses to replace them, so the first setup is careful: Waldur grants one
 * window a lease, secret storage is created first, and the recovery key is
 * escrowed before anything is uploaded. An identity Waldur can't unlock can
 * only be reset with a temporary password Waldur sets, and only when the user
 * asks for it, since a reset loses the keys only the old backup held.
 */

export type CryptoState =
  // Crypto has not started, or the client is gone.
  | 'off'
  | 'starting'
  | 'ready'
  // The homeserver has an identity for the user that Waldur's key can't open.
  | 'locked'
  | 'resetting'
  // Crypto could not start, e.g. the browser refused the crypto WebAssembly.
  | 'error';

type CryptoApiModule = typeof import('matrix-js-sdk/lib/crypto-api');

const loadCryptoApi = (): Promise<CryptoApiModule> =>
  import('matrix-js-sdk/lib/crypto-api');

/**
 * The secret-storage key of one client, in memory for that client's lifetime.
 * matrix-js-sdk asks for it through cryptoCallbacks whenever it reads or
 * writes secret storage.
 */
export class SecretStorageKeyHolder {
  private keyId: string | null = null;
  private key: Uint8Array<ArrayBuffer> | null = null;

  set(key: Uint8Array<ArrayBuffer>, keyId: string | null = null) {
    this.key = key;
    this.keyId = keyId;
  }

  readonly callbacks = {
    getSecretStorageKey: ({
      keys,
    }: {
      keys: Record<string, unknown>;
    }): Promise<[string, Uint8Array<ArrayBuffer>] | null> => {
      if (!this.key) return Promise.resolve(null);
      // Once the key's id is known, it answers for that id only. Before that
      // (a new key, while secret storage is being created) there is just one.
      if (this.keyId) {
        return Promise.resolve(
          keys[this.keyId] ? [this.keyId, this.key] : null,
        );
      }
      const keyId = Object.keys(keys)[0];
      return Promise.resolve(keyId ? [keyId, this.key] : null);
    },
    cacheSecretStorageKey: (
      keyId: string,
      _info: unknown,
      key: Uint8Array<ArrayBuffer>,
    ) => {
      this.set(key, keyId);
    },
  };
}

/** The state Waldur reports when it can't grant a lease or take a key. */
export class CryptoConflict extends Error {
  constructor(
    readonly state: string,
    readonly retryAfterSeconds?: number,
  ) {
    super(`Encryption setup refused: ${state}`);
  }
}

const asConflict = (error: unknown): CryptoConflict | null => {
  const e = error as any;
  if ((e?.response?.status ?? e?.status) !== 409) return null;
  const retryAfter = Number(e?.response?.headers?.get?.('Retry-After'));
  return new CryptoConflict(
    e?.state ?? 'unknown',
    Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter : undefined,
  );
};

const takeLease = async (kind: 'bootstrap' | 'reset') => {
  try {
    return (await matrixCryptoLease({ body: { kind } })).data;
  } catch (error) {
    throw asConflict(error) ?? error;
  }
};

/** End the lease once a setup or reset is done or has failed; best effort. */
const releaseLease = (lease: string) =>
  matrixCryptoLeaseRelease({ body: { lease } }).then(
    () => undefined,
    () => undefined,
  );

const escrow = async (lease: string, recoveryKey: string) => {
  try {
    await matrixCryptoEscrow({ body: { lease, recovery_key: recoveryKey } });
  } catch (error) {
    throw asConflict(error) ?? error;
  }
};

/**
 * Generate the secret-storage key, and hand it to Waldur before matrix-js-sdk
 * writes anything with it. bootstrapSecretStorage awaits this before it
 * uploads, so a crash afterwards still leaves Waldur holding the key.
 */
const escrowedKeyFactory =
  (
    client: MatrixClient,
    lease: string,
    holder: SecretStorageKeyHolder,
  ): (() => Promise<GeneratedSecretStorageKey>) =>
  async () => {
    const generated = await client
      .getCrypto()!
      .createRecoveryKeyFromPassphrase();
    await escrow(lease, generated.encodedPrivateKey!);
    holder.set(generated.privateKey);
    return generated;
  };

/** Start rust crypto with an in-memory store, before the client syncs. */
export const startCrypto = async (client: MatrixClient) => {
  // Loaded first: if it fails, crypto never starts, rather than running with
  // the default mode that shares keys with every device.
  const { OnlySignedDevicesIsolationMode } = await loadCryptoApi();
  await client.initRustCrypto({ useIndexedDB: false });
  // Room keys go only to devices their owner cross-signed, and messages from
  // devices that aren't are refused.
  client
    .getCrypto()!
    .setDeviceIsolationMode(new OnlySignedDevicesIsolationMode());
};

const startDehydration = async (
  client: MatrixClient,
  createNewKey: boolean,
) => {
  const crypto = client.getCrypto()!;
  if (!(await crypto.isDehydrationSupported())) return;
  // Rehydrating picks up the room keys sent while the user had no drawer
  // open, and leaves a fresh dehydrated device behind.
  await crypto.startDehydration(
    createNewKey ? { createNewKey: true } : { rehydrate: true },
  );
};

/** First session of a user without an identity on the homeserver. */
const bootstrap = async (
  client: MatrixClient,
  holder: SecretStorageKeyHolder,
) => {
  const { lease } = await takeLease('bootstrap');
  const crypto = client.getCrypto()!;
  try {
    // Secret storage first: it escrows the key and stores the cross-signing
    // keys before their public halves are uploaded.
    await crypto.bootstrapSecretStorage({
      setupNewSecretStorage: true,
      setupNewKeyBackup: true,
      createSecretStorageKey: escrowedKeyFactory(client, lease, holder),
    });
    await crypto.bootstrapCrossSigning({
      setupNewCrossSigning: true,
      // The first upload needs no interactive auth (MSC3967).
      authUploadDeviceSigningKeys: (makeRequest) => makeRequest(null),
    });
    await startDehydration(client, true);
  } finally {
    await releaseLease(lease);
  }
};

/**
 * The id of the user's default secret-storage key if the key opens it, else
 * null. A description without a MAC confirms nothing (matrix-js-sdk would accept
 * any key for it), as on the Waldur side.
 */
const secretStorageKeyIdOpenedBy = async (
  client: MatrixClient,
  key: Uint8Array<ArrayBuffer>,
): Promise<string | null> => {
  const secretStorage = client.secretStorage;
  const keyId = await secretStorage.getDefaultKeyId();
  if (!keyId) return null;
  const described = await secretStorage.getKey(keyId);
  if (!(described?.[1] as any)?.mac) return null;
  return (await secretStorage.checkKey(key, described![1] as any))
    ? keyId
    : null;
};

/** A later session: unlock what the first one set up. */
const unlock = async (client: MatrixClient, holder: SecretStorageKeyHolder) => {
  const crypto = client.getCrypto()!;
  await crypto.bootstrapCrossSigning({
    // Imports the private keys from secret storage; nothing is replaced.
    authUploadDeviceSigningKeys: (makeRequest) => makeRequest(null),
  });
  const deviceId = client.getDeviceId();
  const status = deviceId
    ? await crypto.getDeviceVerificationStatus(client.getSafeUserId(), deviceId)
    : null;
  if (deviceId && !status?.signedByOwner) {
    // bootstrapCrossSigning can leave the device unsigned when it ran before
    // the identity was known; signing it directly recovers that.
    await crypto.crossSignDevice(deviceId);
  }
  await crypto.loadSessionBackupPrivateKeyFromSecretStorage();
  await crypto.checkKeyBackupAndEnable();
  await startDehydration(client, false);
  // Older room keys come from the backup; nothing waits on it.
  void crypto.restoreKeyBackup().catch(() => undefined);
  void holder;
};

/**
 * Bring the client's crypto to a usable state for the session. Runs once the
 * first sync has finished.
 */
export const setUpEncryption = async (
  client: MatrixClient,
  session: Pick<MatrixSession, 'recovery_key'>,
  holder: SecretStorageKeyHolder,
): Promise<CryptoState> => {
  const crypto = client.getCrypto()!;
  // Must come before bootstrapCrossSigning: without the user's own identity
  // downloaded, importing the private keys fails and the device stays
  // unsigned, and a retry does not help.
  const hasIdentity = await crypto.userHasCrossSigningKeys(
    client.getSafeUserId(),
    true,
  );
  if (!hasIdentity) {
    await bootstrap(client, holder);
    return 'ready';
  }
  if (!session.recovery_key) return 'locked';
  const { decodeRecoveryKey } = await loadCryptoApi();
  const key = decodeRecoveryKey(session.recovery_key);
  const keyId = await secretStorageKeyIdOpenedBy(client, key);
  if (!keyId) return 'locked';
  holder.set(key, keyId);
  await unlock(client, holder);
  return 'ready';
};

/** Answer the homeserver's password prompt with Waldur's temporary password. */
const passwordAuth =
  (userId: string, password: string): UIAuthCallback<void> =>
  async (makeRequest) => {
    try {
      await makeRequest(null);
    } catch (error) {
      const session = (error as any)?.data?.session;
      if ((error as any)?.httpStatus !== 401 || !session) throw error;
      await makeRequest({
        type: 'm.login.password',
        identifier: { type: 'm.id.user', user: userId },
        password,
        session,
      } as any);
    }
  };

/**
 * Replace an identity Waldur can't unlock. The old key backups are deleted;
 * the history the Waldur bot holds is written into the new backup by Waldur.
 */
export const resetEncryption = async (
  client: MatrixClient,
  holder: SecretStorageKeyHolder,
) => {
  const { lease, temporary_password } = await takeLease('reset');
  const crypto = client.getCrypto()!;
  try {
    // Identity first, with the password; then new secret storage, escrowed.
    await crypto.resetEncryption(
      passwordAuth(client.getSafeUserId(), temporary_password!),
    );
    await crypto.bootstrapSecretStorage({
      setupNewSecretStorage: true,
      createSecretStorageKey: escrowedKeyFactory(client, lease, holder),
    });
    await startDehydration(client, true);
  } finally {
    await releaseLease(lease);
  }
};
