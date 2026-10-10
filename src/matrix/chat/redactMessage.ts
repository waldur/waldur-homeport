import {
  Direction,
  EventStatus,
  MatrixClient,
  MatrixEvent,
  MatrixEventEvent,
  RelationType,
} from 'matrix-js-sdk';
import { Feature, ServerSupport } from 'matrix-js-sdk/lib/feature';

import {
  getReplacedEventId,
  getRoomEvents,
  indexEdits,
  RELATIONS_PAGE_SIZE,
} from './messageRelations';

// The edits of one message rarely fill a page; this only bounds a runaway.
const MAX_RELATION_PAGES = 10;
// How long an edit still being sent is waited for before it counts as failed.
const PENDING_EDIT_TIMEOUT_MS = 30_000;

const CANCELLABLE_STATUSES: (EventStatus | null)[] = [
  EventStatus.QUEUED,
  EventStatus.NOT_SENT,
  EventStatus.ENCRYPTING,
];

/**
 * Settle the user's own edit that is still being sent: one not yet on its
 * way is cancelled, one in flight is waited for. Resolves to whether it
 * reached the homeserver and so needs redacting.
 */
function settlePendingEdit(
  client: MatrixClient,
  edit: MatrixEvent,
): Promise<boolean> {
  if (!edit.status || edit.status === EventStatus.SENT) {
    return Promise.resolve(true);
  }
  if (edit.status === EventStatus.CANCELLED) return Promise.resolve(false);
  if (CANCELLABLE_STATUSES.includes(edit.status)) {
    try {
      client.cancelPendingEvent(edit);
      return Promise.resolve(false);
    } catch {
      // Its status moved on meanwhile: wait for it like one being sent.
    }
  }
  return new Promise((resolve, reject) => {
    const stop = () => {
      clearTimeout(timer);
      edit.off(MatrixEventEvent.Status, onStatus);
    };
    const onStatus = (_event: MatrixEvent, status: EventStatus | null) => {
      if (!status || status === EventStatus.SENT) {
        stop();
        resolve(true);
      } else if (status === EventStatus.CANCELLED) {
        stop();
        resolve(false);
      } else if (status === EventStatus.NOT_SENT) {
        // Failed for good: cancel it so a retry can't send it later.
        stop();
        try {
          client.cancelPendingEvent(edit);
        } catch {
          // Already gone.
        }
        resolve(false);
      }
    };
    const timer = setTimeout(() => {
      stop();
      reject(new Error('The edit is still being sent'));
    }, PENDING_EDIT_TIMEOUT_MS);
    edit.on(MatrixEventEvent.Status, onStatus);
  });
}

/** The message's edits the homeserver has, loaded or not. */
async function fetchEdits(
  client: MatrixClient,
  roomId: string,
  eventId: string,
): Promise<MatrixEvent[]> {
  const edits: MatrixEvent[] = [];
  let from: string | undefined;
  for (let page = 0; page < MAX_RELATION_PAGES; page++) {
    const response = await client.fetchRelations(
      roomId,
      eventId,
      RelationType.Replace,
      null,
      { dir: Direction.Backward, from, limit: RELATIONS_PAGE_SIZE },
    );
    edits.push(...response.chunk.map((raw) => new MatrixEvent(raw)));
    from = response.next_batch ?? undefined;
    if (!from) break;
  }
  return edits;
}

/**
 * Delete a message together with its edits. Redacting only the message
 * would leave every edit's text on the homeserver, readable through the
 * relations API or an export.
 *
 * A homeserver with relation-based redactions (MSC3912) deletes the edits
 * along with the message. Any other gets one redaction per edit the user may
 * redact, after the message: an edit still being sent is cancelled or, once
 * sent, redacted too. Resolves to how many edits could not be deleted, and
 * whether the list of edits may be incomplete (it could not be fetched).
 */
export async function redactMessageWithEdits(
  client: MatrixClient,
  roomId: string,
  eventId: string,
  userId: string,
): Promise<{ failed: number; incomplete: boolean }> {
  const support = client.canSupport?.get(Feature.RelationBasedRedactions);
  if (support !== undefined && support !== ServerSupport.Unsupported) {
    await client.redactEvent(roomId, eventId, undefined, {
      with_rel_types: [RelationType.Replace],
    });
    return { failed: 0, incomplete: false };
  }

  // Collected before the message goes: a redacted message's edits are no
  // longer tied to it in the client.
  const room = client.getRoom(roomId);
  const edits = new Map<string, MatrixEvent>();
  let incomplete = false;
  for (const edit of indexEdits(getRoomEvents(room ?? undefined)).get(
    eventId,
  ) ?? []) {
    edits.set(edit.getId(), edit);
  }
  try {
    for (const edit of await fetchEdits(client, roomId, eventId)) {
      if (getReplacedEventId(edit) === eventId && !edits.has(edit.getId())) {
        edits.set(edit.getId(), edit);
      }
    }
  } catch {
    // The loaded edits are still deleted.
    incomplete = true;
  }

  await client.redactEvent(roomId, eventId);

  let failed = 0;
  // Edits still being sent go last, so waiting for them holds up no other.
  const ordered = [...edits.values()].sort(
    (a, b) => Number(Boolean(a.status)) - Number(Boolean(b.status)),
  );
  for (const edit of ordered) {
    if (edit.isRedacted()) continue;
    try {
      if (edit.status) {
        // Only the user's own edits are ever pending. maySendRedaction-
        // ForEvent refuses any pending event, so the homeserver decides.
        if (!(await settlePendingEdit(client, edit))) continue;
      } else if (!room?.currentState.maySendRedactionForEvent(edit, userId)) {
        continue;
      }
      await client.redactEvent(roomId, edit.getId());
    } catch {
      failed++;
    }
  }
  return { failed, incomplete };
}
