import type { Room } from 'matrix-js-sdk';

import { CALL_MEMBER_EVENT, isCallApplication } from './callMembership';

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

interface RawCallMember {
  userId: string;
  deviceId: string;
  expiresAt: number;
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
    if (member.expiresAt <= now) return;
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
        add({
          userId: senderId,
          deviceId: typeof m.device_id === 'string' ? m.device_id : '',
          expiresAt: m.created_ts + expires,
        });
      }
      continue;
    }

    if (
      typeof content.device_id !== 'string' ||
      !isCallApplication(content.application)
    ) {
      continue;
    }
    // The first publish may omit created_ts; it is then the event's own time.
    const createdTs =
      content.created_ts === undefined ? event.getTs?.() : content.created_ts;
    if (!isPositiveNumber(createdTs)) continue;
    const expires = readExpires(content.expires, DEFAULT_SESSION_EXPIRY_MS);
    if (expires === null) continue;
    add({
      userId: senderId,
      deviceId: content.device_id,
      expiresAt: createdTs + expires,
    });
  }

  return Array.from(byDevice.values());
}
