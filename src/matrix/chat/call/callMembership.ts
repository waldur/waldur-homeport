// MatrixRTC call membership (MSC3401 event type, MSC4143 per-device layout).
//
// Each device publishes its own `org.matrix.msc3401.call.member` state event
// under a per-device state key, so two devices of one user never overwrite
// each other: `_@user:server_DEVICE_m.call`, without the leading underscore in
// rooms whose version grants owned state keys (MSC3757/MSC3779).
// matrix-js-sdk's MatrixRTC session publishes and refreshes this device's
// membership (see rtcSession.ts); the helpers here read the others' and
// withdraw ours from a closing tab.

export const CALL_MEMBER_EVENT = 'org.matrix.msc3401.call.member';
const CALL_APPLICATION = 'm.call';
const LEGACY_CALL_APPLICATION = 'org.matrix.msc3401.call';

// setTimeout fires at once for anything above a signed 32-bit delay, and for
// NaN. Delays here derive from `expires` that any room member can write, so a
// bad value must not turn into a busy loop: clamp it, and keep a floor.
const MAX_TIMER_DELAY_MS = 2 ** 31 - 1;
const MIN_TIMER_DELAY_MS = 1000;

export function timerDelay(ms: number): number {
  if (!Number.isFinite(ms)) return MAX_TIMER_DELAY_MS;
  return Math.min(Math.max(MIN_TIMER_DELAY_MS, ms), MAX_TIMER_DELAY_MS);
}

/**
 * The device a call runs on: the Matrix client's own device. Each Waldur tab
 * starts its own Matrix session, so this is per tab, and it is the device the
 * call token is issued for.
 */
export function getCallDeviceId(client: any): string {
  return client?.getDeviceId?.() || '';
}

export function makeCallMemberStateKey(
  userId: string,
  deviceId: string,
  roomVersion = '',
): string {
  const key = `${userId}_${deviceId}_${CALL_APPLICATION}`;
  return /^org\.matrix\.msc(3757|3779)\b/.test(roomVersion) ? key : `_${key}`;
}

export function isCallApplication(application: unknown): boolean {
  return (
    application === CALL_APPLICATION || application === LEGACY_CALL_APPLICATION
  );
}

/**
 * A LiveKit focus as MatrixRTC memberships advertise it (MSC4195): the
 * lk-jwt-compatible token service, and the Matrix room it serves the call of.
 */
export interface LiveKitFocus {
  type: 'livekit';
  livekit_service_url: string;
  livekit_alias?: string;
}

export function makeLiveKitFocus(
  serviceUrl: string,
  roomId: string,
): LiveKitFocus {
  return {
    type: 'livekit',
    livekit_service_url: serviceUrl,
    livekit_alias: roomId,
  };
}

export function isLiveKitFocus(value: unknown): value is LiveKitFocus {
  const focus = value as LiveKitFocus | null;
  return (
    typeof focus === 'object' &&
    focus !== null &&
    focus.type === 'livekit' &&
    typeof focus.livekit_service_url === 'string' &&
    focus.livekit_service_url !== ''
  );
}

/**
 * Best-effort leave for a tab that is closing: React cleanup does not run on
 * unload, and an ordinary request is cancelled with the page, so this sends a
 * keepalive request instead. A crashed tab still relies on the expiry.
 */
export function sendLeaveOnUnload(
  client: any,
  roomId: string,
  stateKey: string,
): void {
  const baseUrl: string | undefined = client?.getHomeserverUrl?.();
  const token: string | null | undefined = client?.getAccessToken?.();
  if (!baseUrl || !token) return;
  const url =
    `${baseUrl.replace(/\/$/, '')}/_matrix/client/v3/rooms/` +
    `${encodeURIComponent(roomId)}/state/${encodeURIComponent(CALL_MEMBER_EVENT)}/` +
    encodeURIComponent(stateKey);
  try {
    fetch(url, {
      method: 'PUT',
      keepalive: true,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: '{}',
    }).catch(() => undefined);
  } catch {
    // The page is going away; nothing left to do.
  }
}
