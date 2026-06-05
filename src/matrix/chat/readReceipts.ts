import type { MatrixClient, ReceiptType } from 'matrix-js-sdk';

/**
 * Advance the room's read receipt to `eventId` so its unread badge clears.
 *
 * Sent unthreaded so the whole room's notification count resets — a threaded
 * receipt would only clear a single thread. Best-effort: callers swallow
 * failures and retry the next time the room is viewed.
 *
 * `matrix-js-sdk` is dynamically imported elsewhere to keep it out of the
 * bundle, so the receipt type is passed as its literal string value rather
 * than via the `ReceiptType` enum (a type-only import erases at compile time).
 */
export async function sendRoomReadReceipt(
  client: MatrixClient,
  roomId: string,
  eventId: string,
): Promise<void> {
  // Local/pending event ids start with '~' until the server echoes the
  // send back; real Matrix event ids start with '$'. Homeservers reject
  // receipts whose target id has the wrong sigil with M_BAD_JSON, so
  // skip until the real id is known — the next message-driven render
  // will report it.
  if (eventId.startsWith('~')) return;
  const event = client.getRoom(roomId)?.findEventById(eventId);
  if (!event) return;
  const currentId = event.getId();
  if (!currentId || currentId.startsWith('~')) return;
  await client.sendReadReceipt(event, 'm.read' as ReceiptType, true);
}
