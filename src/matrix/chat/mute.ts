import { MatrixClient, PushRuleActionName } from 'matrix-js-sdk';

/** A room is muted when it has a room-kind push rule that suppresses notify. */
export function isRoomMuted(
  client: MatrixClient | null,
  roomId: string | null,
): boolean {
  if (!client || !roomId) return false;
  const rule = client.getRoomPushRule('global', roomId);
  return Boolean(rule?.actions?.includes(PushRuleActionName.DontNotify));
}

/** Add (mute) or remove (unmute) the room's dont_notify push rule. */
export function setRoomMuted(
  client: MatrixClient,
  roomId: string,
  muted: boolean,
): Promise<void> | undefined {
  return client.setRoomMutePushRule('global', roomId, muted);
}
