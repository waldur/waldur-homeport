import { MatrixClient, PushRuleActionName } from 'matrix-js-sdk';

/** A room is muted when it has a room-kind push rule that suppresses notify. */
export function isRoomMuted(
  client: MatrixClient | null,
  roomId: string | null,
): boolean {
  if (!client || !roomId) return false;
  // Push rules are only populated once the initial sync completes; reading them
  // earlier (e.g. during the impersonation teardown/reconnect window) makes the
  // SDK throw "SyncApi.sync() must be done before accessing to push rules".
  if (!client.isInitialSyncComplete()) return false;
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
