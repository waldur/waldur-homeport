import type { MatrixClient } from 'matrix-js-sdk';

import type { EncryptedFile } from './attachmentCrypto';
import type { CryptoState } from './crypto';

export interface ReactionAggregate {
  /** The reaction key — typically a unicode emoji, e.g. "👍". */
  key: string;
  count: number;
  reactedByMe: boolean;
  /** The current user's reaction event_id — needed to redact (unreact). */
  myEventId?: string;
}

/** Where an uploaded attachment is: a plain `url`, or an encrypted `file`. */
export type UploadedMedia = { url: string } | { file: EncryptedFile };

export interface MatrixChatMessage {
  eventId: string;
  /**
   * Transaction id of an outgoing message (present only on the local echo and
   * its own remote echo). Used to reconcile the two into one row under the
   * client's detached pending-event ordering.
   */
  txnId?: string;
  sender: string;
  senderDisplayName: string;
  body: string;
  timestamp: number;
  type: string;
  /** mxc:// or https:// URL for media messages */
  url?: string;
  /** Encrypted media: where the ciphertext is and how to decrypt it. */
  file?: EncryptedFile;
  /** The event carried an encrypted `file` that failed validation. */
  fileInvalid?: boolean;
  /** Media metadata (mimetype, width, height, size) */
  info?: { mimetype?: string; w?: number; h?: number; size?: number };
  reactions?: ReactionAggregate[];
  /** Map from emoji key → reactor user_ids, for tooltip rendering. */
  reactors?: Record<string, string[]>;
  /** Matrix user IDs mentioned in this message (from `m.mentions.user_ids`). */
  mentionedUserIds?: string[];
  /** True for MSC3245 voice messages (`org.matrix.msc3245.voice` present). */
  isVoice?: boolean;
  /**
   * MSC1767 audio waveform as integers 0..1024 (from
   * `org.matrix.msc1767.audio.waveform`). Present on voice messages so the
   * renderer can draw the bars without re-decoding the audio.
   */
  waveform?: number[];
  /** Clip length in ms (from `org.matrix.msc1767.audio.duration` or info.duration). */
  durationMs?: number;
  /**
   * Sent in clear into an encrypted room: whoever wrote it bypassed
   * encryption (or the homeserver injected it), so it is shown as such.
   */
  unencrypted?: boolean;
  /** The message this one replies to (`m.in_reply_to`). */
  replyToEventId?: string;
  /** Shown as replaced by a valid edit from its sender. */
  edited?: boolean;
  /** Deleted (redacted): shown as a placeholder, without its content. */
  redacted?: boolean;
}

export type MatrixConnectionState =
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'error'
  | 'disconnected'
  // Waldur refused a new session, or the homeserver kept signing it out.
  | 'ended';

export interface MatrixChatContextValue {
  client: MatrixClient | null;
  connectionState: MatrixConnectionState;
  activeRoomId: string | null;
  /** Waldur UUID of the room the client is currently synced to. */
  activeRoomUuid: string | null;
  userId: string | null;
  /**
   * Connect (or switch rooms on) the shared client. Pass
   * `{ activate: false }` to bootstrap the sync for app-wide unread counts
   * without focusing the room — focusing auto-marks a room read on view.
   */
  connect: (
    roomUuid: string,
    options?: { activate?: boolean },
  ) => Promise<void>;
  disconnect: () => void;
  error: string | null;
  /**
   * True when the open endpoint refused the most recently requested room
   * (403/404): the user can see or manage the room but is not a member of the
   * conversation (e.g. staff or a non-member owner). Lets the UI show a clear
   * "not a member" state instead of an empty placeholder.
   */
  roomAccessDenied: boolean;
  /** End-to-end encryption of the current client; see `./crypto`. */
  cryptoState: CryptoState;
  /**
   * Replace an encryption identity Waldur can't unlock. Only on the user's
   * explicit request: the keys only the old backup held are lost.
   */
  resetCryptoIdentity: () => Promise<void>;
  /**
   * Unlock an identity Waldur can't unlock with the recovery key the user
   * holds from another client, and escrow it. Rejects with WrongRecoveryKey
   * when the key does not open the user's secret storage.
   */
  importCryptoRecoveryKey: (recoveryKey: string) => Promise<void>;
}
