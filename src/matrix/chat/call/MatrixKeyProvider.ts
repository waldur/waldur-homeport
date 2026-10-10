import { BaseKeyProvider, createKeyMaterialFromBuffer } from 'livekit-client';

const KEY_CHANGED = 'encryption_key_changed';

/**
 * The part of a MatrixRTC session that hands out media keys, emitting
 * `encryption_key_changed` for each.
 */
export interface MediaKeySource {
  on(event: any, listener: any): unknown;
  off(event: any, listener: any): unknown;
  reemitEncryptionKeys(): void;
}

type KeyListener = (
  key: Uint8Array<ArrayBuffer>,
  index: number,
  membership: unknown,
  rtcBackendIdentity: string,
) => void;

/**
 * Hands LiveKit's end-to-end encryption the per-participant media keys a
 * MatrixRTC session exchanges, as Element Call's MatrixKeyProvider does: each
 * key belongs to the LiveKit identity of the member who sent it (ours
 * included), under the index it was sent with.
 */
export class MatrixKeyProvider extends BaseKeyProvider {
  private source: MediaKeySource | null = null;
  // Keys are imported one after another, so they are set in the order the
  // session hands them out: a later key for an index replaces an earlier one.
  private imports: Promise<unknown> = Promise.resolve();

  // The index of our own newest key.
  private ownKeyIndex: number | undefined;

  /** `localIdentity` is our own LiveKit identity, `@user:server:DEVICE`. */
  public constructor(private readonly localIdentity: string) {
    // Key indexes run up to 255; the ratchet window matches Element Call's.
    super({ ratchetWindowSize: 10, keyringSize: 256 });
  }

  /**
   * The index LiveKit encrypts our media with after (re)connecting. The base
   * class answers with the index of whichever key was set last, which may be
   * another member's; ours could then go back to an older key that a member
   * who has left still holds.
   */
  public getLatestManuallySetKeyIndex(): number {
    return this.ownKeyIndex ?? super.getLatestManuallySetKeyIndex();
  }

  /** Takes keys from `source` from now on, including those it already has. */
  public setSource(source: MediaKeySource | null): void {
    this.source?.off(KEY_CHANGED, this.onKey);
    this.source = source;
    if (!source) return;
    source.on(KEY_CHANGED, this.onKey);
    source.reemitEncryptionKeys();
  }

  private readonly onKey: KeyListener = (key, index, _membership, identity) => {
    const source = this.source;
    // A copy: the key may be a view into a larger buffer.
    const raw = key.slice().buffer;
    this.imports = this.imports
      .then(() => createKeyMaterialFromBuffer(raw))
      .then((material) => {
        // A key still importing when the source changed belongs to the old
        // one.
        if (this.source === source) {
          if (identity === this.localIdentity) this.ownKeyIndex = index;
          this.onSetEncryptionKey(material, identity, index);
        }
      })
      .catch(() => undefined);
  };
}
