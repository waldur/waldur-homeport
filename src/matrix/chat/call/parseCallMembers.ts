import type { Room } from 'matrix-js-sdk';

import {
  CALL_MEMBER_EVENT,
  isCallApplication,
  isLiveKitFocus,
  LiveKitFocus,
} from './callMembership';

// matrix-js-sdk's default when a membership carries no `expires`.
const DEFAULT_SESSION_EXPIRY_MS = 4 * 60 * 60 * 1000;
// Older default for the legacy `memberships` array layout.
const DEFAULT_LEGACY_EXPIRY_MS = 60 * 60 * 1000;

// Any room member can write these events, so every number is checked: a NaN
// or string here would otherwise reach a timer delay.
const isPositiveNumber = (v: unknown): v is number =>
  typeof v === 'number' && Number.isFinite(v) && v > 0;

/** `expires` if valid, the default if absent, null to skip the entry. */
function readExpires(value: unknown, fallback: number): number | null {
  if (value === undefined || value === null) return fallback;
  return isPositiveNumber(value) ? value : null;
}

// No client keeps a membership valid for more than matrix-js-sdk's default
// expiry ahead of now: a refresh extends `expires` while `created_ts` stays,
// so a long call carries a large `expires`, but never a far-off end.
const MAX_REMAINING_VALIDITY_MS = DEFAULT_SESSION_EXPIRY_MS;
// Tolerated clock difference between this browser and the publisher.
const CLOCK_SKEW_MS = 5 * 60 * 1000;

/**
 * When a membership stops being valid, or null when it is not valid now: it
 * has expired, claims to be created in the future, or claims a validity
 * reaching further ahead than any client publishes. This keeps a crafted
 * membership from lingering for good; it can still claim to be the oldest,
 * which is harmless because only our own call services are ever followed.
 * A deployment that configures longer membership expiry than this would see
 * its members dropped from the list.
 */
function validUntil(
  createdTs: number,
  expires: number,
  now: number,
): number | null {
  const expiresAt = createdTs + expires;
  if (createdTs > now + CLOCK_SKEW_MS) return null;
  if (expiresAt <= now) return null;
  if (expiresAt > now + MAX_REMAINING_VALIDITY_MS + CLOCK_SKEW_MS) return null;
  return expiresAt;
}

interface RawCallMember {
  userId: string;
  deviceId: string;
  expiresAt: number;
}

// The room's own call: `call_id` "" (matrix-js-sdk's slot `m.call#ROOM`).
// Other call ids are separate calls this client does not join.
function isRoomCallSession(content: any): boolean {
  return (
    typeof content.device_id === 'string' &&
    isCallApplication(content.application) &&
    (content.call_id === undefined || content.call_id === '')
  );
}

// Two layouts share the event type:
// - per-device (MSC4143): state key `_@user:server_DEVICE_m.call`, the content
//   is one membership, `{}` once the device has left;
// - legacy: state key is the bare user id, the content holds a `memberships`
//   array for all of that user's devices.
// Both are read while clients move from the legacy layout to the per-device one.
export function parseCallMembers(room: Room, now: number): RawCallMember[] {
  const events = (room.currentState as any).getStateEvents(
    CALL_MEMBER_EVENT,
  ) as any[];
  const byDevice = new Map<string, RawCallMember>();

  const add = (member: RawCallMember) => {
    const key = `${member.userId}\u0000${member.deviceId}`;
    const existing = byDevice.get(key);
    if (!existing || existing.expiresAt < member.expiresAt) {
      byDevice.set(key, member);
    }
  };

  for (const event of events) {
    const senderId = event.getSender();
    if (!senderId) continue;
    const content = event.getContent() ?? {};

    if (Array.isArray(content.memberships)) {
      for (const m of content.memberships) {
        if (!isPositiveNumber(m?.created_ts)) continue;
        const expires = readExpires(m.expires, DEFAULT_LEGACY_EXPIRY_MS);
        if (expires === null) continue;
        const expiresAt = validUntil(m.created_ts, expires, now);
        if (expiresAt === null) continue;
        add({
          userId: senderId,
          deviceId: typeof m.device_id === 'string' ? m.device_id : '',
          expiresAt,
        });
      }
      continue;
    }

    if (!isRoomCallSession(content)) continue;
    // The first publish may omit created_ts; it is then the event's own time.
    const createdTs =
      content.created_ts === undefined ? event.getTs?.() : content.created_ts;
    if (!isPositiveNumber(createdTs)) continue;
    const expires = readExpires(content.expires, DEFAULT_SESSION_EXPIRY_MS);
    if (expires === null) continue;
    const expiresAt = validUntil(createdTs, expires, now);
    if (expiresAt === null) continue;
    add({
      userId: senderId,
      deviceId: content.device_id,
      expiresAt,
    });
  }

  return Array.from(byDevice.values());
}

/**
 * The focus the room's call runs on, for a member that follows the oldest
 * membership: the first preferred focus of the oldest valid session
 * membership, as matrix-js-sdk's CallMembership.getTransport resolves it.
 * Element Call (multi_sfu) publishes on its own first preferred focus, which
 * is the same thing when it is the oldest. Null when there is none, or the
 * oldest member advertises no LiveKit focus; `exclude` skips our own device.
 */
export function findActiveFocus(
  room: Room | null | undefined,
  now: number,
  exclude?: { userId: string; deviceId: string },
): LiveKitFocus | null {
  const events = ((room?.currentState as any)?.getStateEvents?.(
    CALL_MEMBER_EVENT,
  ) ?? []) as any[];
  let oldest: { createdTs: number; focus: unknown } | null = null;
  for (const event of events) {
    const senderId = event.getSender?.();
    const content = event.getContent?.() ?? {};
    if (!senderId || !isRoomCallSession(content)) continue;
    if (
      exclude &&
      senderId === exclude.userId &&
      content.device_id === exclude.deviceId
    ) {
      continue;
    }
    const createdTs =
      content.created_ts === undefined ? event.getTs?.() : content.created_ts;
    if (!isPositiveNumber(createdTs)) continue;
    const expires = readExpires(content.expires, DEFAULT_SESSION_EXPIRY_MS);
    if (expires === null || validUntil(createdTs, expires, now) === null) {
      continue;
    }
    if (!oldest || createdTs < oldest.createdTs) {
      oldest = {
        createdTs,
        focus: Array.isArray(content.foci_preferred)
          ? content.foci_preferred[0]
          : undefined,
      };
    }
  }
  return oldest && isLiveKitFocus(oldest.focus) ? oldest.focus : null;
}
