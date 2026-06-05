import type { Room } from 'matrix-js-sdk';

const CALL_MEMBER_EVENT = 'org.matrix.msc3401.call.member';
const DEFAULT_MEMBERSHIP_EXPIRY_MS = 60 * 60 * 1000;

interface RawCallMember {
  userId: string;
  deviceId: string;
  expiresAt: number;
}

export function parseCallMembers(room: Room, now: number): RawCallMember[] {
  const events = (room.currentState as any).getStateEvents(
    CALL_MEMBER_EVENT,
  ) as any[];
  const out: RawCallMember[] = [];

  for (const event of events) {
    const senderId = event.getSender();
    if (!senderId) continue;

    const content = event.getContent();
    const memberships = content?.memberships ?? [];

    for (const m of memberships) {
      if (!m.created_ts) continue;
      const expiresAt =
        m.created_ts + (m.expires || DEFAULT_MEMBERSHIP_EXPIRY_MS);
      if (expiresAt <= now) continue;
      out.push({
        userId: senderId,
        deviceId: m.device_id || '',
        expiresAt,
      });
    }
  }

  return out;
}
