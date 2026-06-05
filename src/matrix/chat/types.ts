import type { MatrixClient } from 'matrix-js-sdk';

export interface ReactionAggregate {
  /** The reaction key — typically a unicode emoji, e.g. "👍". */
  key: string;
  count: number;
  reactedByMe: boolean;
  /** The current user's reaction event_id — needed to redact (unreact). */
  myEventId?: string;
}

export interface MatrixChatMessage {
  eventId: string;
  sender: string;
  senderDisplayName: string;
  body: string;
  timestamp: number;
  type: string;
  /** mxc:// or https:// URL for media messages */
  url?: string;
  /** Media metadata (mimetype, width, height, size) */
  info?: { mimetype?: string; w?: number; h?: number; size?: number };
  reactions?: ReactionAggregate[];
  /** Map from emoji key → reactor user_ids, for tooltip rendering. */
  reactors?: Record<string, string[]>;
  /** Matrix user IDs mentioned in this message (from `m.mentions.user_ids`). */
  mentionedUserIds?: string[];
}

export type MatrixConnectionState =
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'error'
  | 'disconnected';

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
   * True when the most recently requested room was resolved but the backend
   * withheld conversation access (no room_id/access_token) — i.e. the user can
   * see/manage the room but is not a member of the conversation (e.g. staff or
   * a non-member owner). Lets the UI show a clear "not a member" state instead
   * of an empty placeholder.
   */
  roomAccessDenied: boolean;
}
