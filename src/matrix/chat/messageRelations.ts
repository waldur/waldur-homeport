import type { MatrixEvent, Room } from 'matrix-js-sdk';

/** Message type of the row standing in for a deleted (redacted) message. */
export const REDACTED_MESSAGE_TYPE = 'waldur.redacted';

/**
 * Page size for the relations API: servers default to small pages (Synapse
 * returns 5), which would leave most of a message's edits unseen.
 */
export const RELATIONS_PAGE_SIZE = 100;

/** Message types whose text can be edited in place. */
const EDITABLE_MSGTYPES = new Set(['m.text', 'm.emote', 'm.notice']);

export const isEditableMsgtype = (msgtype: string) =>
  EDITABLE_MSGTYPES.has(msgtype);

/**
 * The event's m.relates_to. matrix-js-sdk lifts it out of the ciphertext when
 * sending to an encrypted room, so it is read from the wire content, which is
 * the plain content for an unencrypted event or a local echo.
 */
function getRelatesTo(event: MatrixEvent): Record<string, any> | undefined {
  const content = event.getWireContent?.() ?? event.getContent?.();
  const relatesTo = content?.['m.relates_to'];
  return relatesTo && typeof relatesTo === 'object' ? relatesTo : undefined;
}

/** The event an m.replace (edit) event replaces, if it is one. */
export function getReplacedEventId(event: MatrixEvent): string | undefined {
  if (event.isState?.()) return undefined;
  const relatesTo = getRelatesTo(event);
  return relatesTo?.rel_type === 'm.replace' &&
    typeof relatesTo.event_id === 'string'
    ? relatesTo.event_id
    : undefined;
}

/** The event this message replies to (a rich reply), if any. */
export function getReplyToEventId(event: MatrixEvent): string | undefined {
  const relatesTo = getRelatesTo(event);
  if (!relatesTo) return undefined;
  // A threaded message carries the thread's last event as a fallback reply
  // for clients without threads; it isn't a reply the sender chose.
  if (relatesTo.rel_type === 'm.thread' && relatesTo.is_falling_back) {
    return undefined;
  }
  const id = relatesTo['m.in_reply_to']?.event_id;
  return typeof id === 'string' ? id : undefined;
}

/**
 * Whether `edit` may replace `original`, following the Matrix spec's rules
 * for m.replace. matrix-js-sdk applies the newest edit from the same sender on
 * its own (getContent), but that check alone would still let an edit replace
 * an edit or a message of another type, so every candidate is judged here.
 */
export function isValidEdit(original: MatrixEvent, edit: MatrixEvent): boolean {
  if (getReplacedEventId(edit) !== original.getId()) return false;
  // Only the original sender may edit a message: anyone else's "edit" would
  // put their words under the original sender's name.
  if (!edit.getSender() || edit.getSender() !== original.getSender()) {
    return false;
  }
  // An edit can't be edited, and a deleted message stays deleted.
  if (getReplacedEventId(original)) return false;
  if (original.isRedacted?.() || edit.isRedacted?.()) return false;
  if (edit.isDecryptionFailure?.()) return false;
  if (edit.status === 'not_sent' || edit.status === 'cancelled') return false;
  // Same event type: until it is decrypted an encrypted edit is
  // m.room.encrypted, so it waits for decryption like any other message.
  if (edit.getType() !== original.getType()) return false;
  // An encrypted message is only edited by an encrypted edit: one in clear
  // could have been written by the homeserver. The user's own edit is
  // encrypted only as it is sent, so one still pending is let through.
  if (original.isEncrypted?.() && !edit.isEncrypted?.() && !edit.status) {
    return false;
  }
  const newContent = (edit.getOriginalContent?.() ?? edit.getContent())?.[
    'm.new_content'
  ];
  return (
    !!newContent &&
    typeof newContent === 'object' &&
    typeof newContent.msgtype === 'string' &&
    typeof newContent.body === 'string'
  );
}

/**
 * The edit that decides what `original` says now: the newest valid one, ties
 * going to the lexicographically greatest event id, as the spec orders them.
 */
export function selectLatestEdit(
  original: MatrixEvent,
  candidates: Iterable<MatrixEvent | null | undefined>,
): MatrixEvent | null {
  let latest: MatrixEvent | null = null;
  for (const edit of candidates) {
    if (!edit || !isValidEdit(original, edit)) continue;
    if (
      !latest ||
      edit.getTs() > latest.getTs() ||
      (edit.getTs() === latest.getTs() && edit.getId() > latest.getId())
    ) {
      latest = edit;
    }
  }
  return latest;
}

/**
 * What a message says now: the content of its newest valid edit, or its own.
 * The SDK's getContent() would apply an edit checked only for its sender.
 * Returns the edit too, or null when the original content is shown.
 */
export function getDisplayedContent(
  event: MatrixEvent,
  room?: Room,
  editsIndex?: Map<string, MatrixEvent[]>,
): { content: Record<string, any>; edit: MatrixEvent | null } {
  const candidates = editsIndex
    ? (editsIndex.get(event.getId()) ?? [])
    : (indexEdits(getRoomEvents(room)).get(event.getId()) ?? []);
  const edit = selectLatestEdit(event, [
    ...candidates,
    event.replacingEvent?.(),
  ]);
  const content = edit
    ? (edit.getOriginalContent?.() ?? edit.getContent())['m.new_content']
    : (event.getOriginalContent?.() ?? event.getContent());
  return { content: content ?? {}, edit };
}

/** Edit events by the id of the event they replace. */
export function indexEdits(events: MatrixEvent[]): Map<string, MatrixEvent[]> {
  const index = new Map<string, MatrixEvent[]>();
  for (const event of events) {
    const targetId = getReplacedEventId(event);
    if (!targetId) continue;
    const list = index.get(targetId);
    if (list) list.push(event);
    else index.set(targetId, [event]);
  }
  return index;
}

/**
 * The room's loaded events, including the user's own still being sent: the
 * client keeps those out of the live timeline until the homeserver accepts
 * them, and an edit should show as soon as it is made.
 */
export function getRoomEvents(room: Room | undefined): MatrixEvent[] {
  if (!room) return [];
  const events = room.getLiveTimeline?.().getEvents() ?? [];
  let pending: MatrixEvent[] = [];
  try {
    pending = room.getPendingEvents?.() ?? [];
  } catch {
    // Only available with detached pending-event ordering.
  }
  return pending.length ? [...events, ...pending] : events;
}

/**
 * Strip a reply fallback: the "> " quote of the parent that older clients put
 * at the top of a reply's body. The spec no longer sends it, but messages
 * from before still carry it.
 */
export function stripReplyFallback(body: string): string {
  // The fallback opens with the parent's sender ("> <@user:server> ...", or
  // "> * <@user:server> ..." for an emote), so a reply that merely starts
  // with a quote of its own is left alone.
  if (!body.startsWith('> <@') && !body.startsWith('> * <@')) return body;
  const lines = body.split('\n');
  let i = 0;
  while (i < lines.length && lines[i].startsWith('> ')) i++;
  if (i === 0) return body;
  if (lines[i] === '') i++;
  return lines.slice(i).join('\n');
}
