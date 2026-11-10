import {
  ConditionKind,
  MatrixClient,
  PushRuleActionName,
  PushRuleKind,
} from 'matrix-js-sdk';

/**
 * How much of a room reaches the user: every message, mentions and replies
 * (the default), or nothing.
 */
export type RoomNotificationLevel = 'all' | 'mentions' | 'mute';

/**
 * Room account data for All and Mentions only. They stay out of the push
 * rules, so All adds toasts here without changing phone notifications.
 */
export const NOTIFICATION_LEVEL_EVENT_TYPE = 'com.waldur.notification_level';

declare module 'matrix-js-sdk' {
  interface RoomAccountDataEvents {
    [NOTIFICATION_LEVEL_EVENT_TYPE]: { level: 'all' | 'mentions' };
  }
}

// Element's mute: an override rule named after the room that does nothing,
// so it silences mentions too.
const findMuteOverride = (client: MatrixClient, roomId: string) =>
  client.pushRules?.global?.override?.find(
    (rule) =>
      rule.rule_id === roomId &&
      !rule.actions.includes(PushRuleActionName.Notify),
  );

// This app's earlier Mute: a room rule that lets mentions through.
const findLegacyMute = (client: MatrixClient, roomId: string) => {
  const rule = client.getRoomPushRule('global', roomId);
  return rule?.actions.includes(PushRuleActionName.DontNotify)
    ? rule
    : undefined;
};

export function getRoomNotificationLevel(
  client: MatrixClient | null,
  roomId: string | null,
): RoomNotificationLevel {
  if (!client || !roomId) return 'mentions';
  // Push rules are only populated once the initial sync completes; reading them
  // earlier (e.g. during the impersonation teardown/reconnect window) makes the
  // SDK throw "SyncApi.sync() must be done before accessing to push rules".
  if (!client.isInitialSyncComplete()) return 'mentions';
  if (findMuteOverride(client, roomId) || findLegacyMute(client, roomId)) {
    return 'mute';
  }
  const stored = client
    .getRoom(roomId)
    ?.getAccountData(NOTIFICATION_LEVEL_EVENT_TYPE)
    ?.getContent();
  return stored?.level === 'all' ? 'all' : 'mentions';
}

/** Kept for the room list's muted icon. */
export function isRoomMuted(
  client: MatrixClient | null,
  roomId: string | null,
): boolean {
  return getRoomNotificationLevel(client, roomId) === 'mute';
}

export async function setRoomNotificationLevel(
  client: MatrixClient,
  roomId: string,
  level: RoomNotificationLevel,
): Promise<void> {
  // The server refuses to delete a rule that is not there, so each is
  // deleted only when the known rules have it.
  const muteOverride = findMuteOverride(client, roomId);
  const legacyMute = findLegacyMute(client, roomId);
  try {
    if (level === 'mute') {
      await client.addPushRule('global', PushRuleKind.Override, roomId, {
        actions: [],
        conditions: [
          { kind: ConditionKind.EventMatch, key: 'room_id', pattern: roomId },
        ],
      });
    } else if (muteOverride) {
      await client.deletePushRule('global', PushRuleKind.Override, roomId);
    }
    if (legacyMute) {
      await client.deletePushRule('global', PushRuleKind.RoomSpecific, roomId);
    }
  } finally {
    if (level === 'mute' || muteOverride || legacyMute) {
      // The rules reach the client only with the next sync. A second pick
      // before it, or a retry after a partial failure, would read the old
      // ones: after Mute, All would find no override to delete, and the room
      // would stay muted. getPushRules stores what it fetches in the client;
      // if it fails, that next sync still brings the rules.
      await client.getPushRules().catch(() => undefined);
    }
  }
  if (level !== 'mute') {
    await client.setRoomAccountData(roomId, NOTIFICATION_LEVEL_EVENT_TYPE, {
      level,
    });
  }
}
