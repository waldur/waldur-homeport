// MatrixRTC call membership (MSC3401 event type, MSC4143 per-device layout).
//
// Each device publishes its own `org.matrix.msc3401.call.member` state event
// under a per-device state key, so two devices of one user never overwrite
// each other. The layout matches matrix-js-sdk's MembershipManager (what
// Element Call uses): `_@user:server_DEVICE_m.call`, without the leading
// underscore in rooms whose version grants owned state keys (MSC3757/MSC3779).
//
// The membership stays valid until `created_ts + expires`. Instead of
// re-sending on a short heartbeat, the publisher re-sends once, shortly
// before that moment, with `created_ts` unchanged and `expires` extended —
// again as matrix-js-sdk does, since `created_ts` orders members for focus
// selection and must keep meaning "joined at".

export const CALL_MEMBER_EVENT = 'org.matrix.msc3401.call.member';
const CALL_APPLICATION = 'm.call';
const LEGACY_CALL_APPLICATION = 'org.matrix.msc3401.call';

/** How long one published membership stays valid. */
export const MEMBERSHIP_EXPIRY_MS = 60 * 60 * 1000;
/**
 * How long before expiry the membership is re-published. Generous because
 * browsers throttle timers in background tabs to about once a minute.
 */
export const MEMBERSHIP_REFRESH_HEADROOM_MS = 2 * 60 * 1000;
/** Retry delay after a failed refresh. */
export const MEMBERSHIP_REFRESH_RETRY_MS = 15 * 1000;

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

export interface CallMembershipTiming {
  /** When this device joined; kept across refreshes. */
  createdTs: number;
  /** Validity, counted from createdTs. */
  expires: number;
}

export function makeCallMembershipContent(
  deviceId: string,
  { createdTs, expires }: CallMembershipTiming,
) {
  return {
    application: CALL_APPLICATION,
    call_id: '',
    scope: 'm.room',
    device_id: deviceId,
    created_ts: createdTs,
    expires,
    focus_active: { type: 'livekit', focus_selection: 'oldest_membership' },
    foci_preferred: [],
  };
}

/**
 * Keeps a published membership alive: waits until shortly before it expires,
 * then calls `send` with an extended `expires`. Returns a stop function.
 */
export function startMembershipRefresh(
  initial: CallMembershipTiming,
  send: (timing: CallMembershipTiming) => Promise<unknown>,
): () => void {
  let current = initial;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let stopped = false;

  const schedule = (delay: number) => {
    if (stopped) return;
    timer = setTimeout(fire, timerDelay(delay));
  };

  const fire = () => {
    timer = null;
    const next: CallMembershipTiming = {
      createdTs: current.createdTs,
      expires: Date.now() - current.createdTs + MEMBERSHIP_EXPIRY_MS,
    };
    send(next).then(
      () => {
        current = next;
        schedule(
          current.createdTs +
            current.expires -
            MEMBERSHIP_REFRESH_HEADROOM_MS -
            Date.now(),
        );
      },
      () => schedule(MEMBERSHIP_REFRESH_RETRY_MS),
    );
  };

  schedule(
    current.createdTs +
      current.expires -
      MEMBERSHIP_REFRESH_HEADROOM_MS -
      Date.now(),
  );

  return () => {
    stopped = true;
    if (timer) clearTimeout(timer);
  };
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
