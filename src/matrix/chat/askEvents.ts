import type { MatrixClient, MatrixEvent } from 'matrix-js-sdk';

import { getReplacedEventId } from './messageRelations';
import { isBotUser } from './utils';

/** A personal mention (or a reply to me), or an admin's `@room`. */
export type AskKind = 'mention' | 'room';

// Long enough for the read receipt of a member already looking at the room to
// arrive, so they never get a toast for what they just read.
export const ASK_DELAY_MS = 2000;
export const ASK_TOAST_DURATION_MS = 15000;
// A live event can still be old, e.g. one federated late. The catch-up after a
// sync error arrives before the client counts as synced again, and is skipped
// for that instead.
export const ASK_MAX_EVENT_AGE_MS = 300000;

/** One toast per room: a second ask updates it instead of stacking. */
export const askToastId = (roomId: string) => `matrix-ask:${roomId}`;

// More welcomes than this on screen at once collapse into one toast, e.g. at
// the first login after chats started in many of the member's projects, or
// for a member added to many chats at once.
export const WELCOME_TOAST_LIMIT = 3;
export const WELCOME_SUMMARY_TOAST_ID = 'matrix-welcomes';

// Mastermind's WELCOME_CONTENT_KEY.
const WELCOME_CONTENT_KEY = 'com.waldur.welcome';

/**
 * The room bot's welcome for me, the one bot message that is toasted, as it
 * is how a member learns the chat exists: the room's welcome when the chat
 * starts, which names nobody, or the notice of my role when I joined later,
 * which names me. A member who joins after the room's welcome finds it read,
 * as the SDK counts what came before their join as read. Any member can put
 * the marker in a message of their own.
 */
export function isWelcome(
  event: MatrixEvent,
  botUserId: string | undefined,
  ownUserId: string,
): boolean {
  if (!botUserId || event.getSender() !== botUserId) return false;
  if (event.getType() !== 'm.room.message' || event.isRedacted()) return false;
  if (getReplacedEventId(event)) return false;
  const content = event.getContent();
  if (content[WELCOME_CONTENT_KEY] !== true) return false;
  const userIds = content['m.mentions']?.user_ids;
  return (
    !Array.isArray(userIds) || !userIds.length || userIds.includes(ownUserId)
  );
}

const isOthersMessage = (event: MatrixEvent, ownUserId: string) => {
  const sender = event.getSender();
  if (!sender || sender === ownUserId || isBotUser(sender)) return false;
  return event.getType() === 'm.room.message' && !event.isRedacted();
};

/** Another member's new message, which a room set to All toasts too. */
export const isNewMessage = (event: MatrixEvent, ownUserId: string) =>
  // An edit changes a message the user was already told about.
  isOthersMessage(event, ownUserId) && !getReplacedEventId(event);

/**
 * Whether the event asks for my attention. The homeserver's push rules decide
 * it, as they do for a phone notification, but rooms are encrypted, so they
 * can only be evaluated here, on the decrypted event.
 */
export function getAskKind(
  client: MatrixClient,
  event: MatrixEvent,
  ownUserId: string,
): AskKind | null {
  if (!isOthersMessage(event, ownUserId)) return null;
  // Forced: actions cached on the event were computed from the encrypted
  // envelope, before the mention in its content was visible.
  const actions = client.getPushActionsForEvent(event, true);
  if (!actions?.notify || !actions.tweaks?.highlight) return null;
  const mentions = event.getContent()['m.mentions'];
  // The sender's JSON: a crafted user_ids that isn't an array would throw
  // inside the SDK's event dispatch.
  const userIds = Array.isArray(mentions?.user_ids) ? mentions.user_ids : [];
  if (mentions?.room === true && !userIds.includes(ownUserId)) {
    return 'room';
  }
  return 'mention';
}
