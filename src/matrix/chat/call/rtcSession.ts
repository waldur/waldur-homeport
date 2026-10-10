import {
  EventTimeline,
  MatrixClient,
  MatrixEvent,
  Room,
  RoomStateEvent,
} from 'matrix-js-sdk';

import {
  CALL_MEMBER_EVENT,
  makeCallMemberStateKey,
  sendLeaveOnUnload,
} from './callMembership';
import { keyGatedClient } from './keyGatedClient';
import { isValidCallMemberEvent } from './parseCallMembers';

type MatrixRTCModule = typeof import('matrix-js-sdk/lib/matrixrtc');
export type CallSession = InstanceType<MatrixRTCModule['MatrixRTCSession']>;

// matrix-js-sdk does not export MatrixRTC from its root.
const loadMatrixRTC = (): Promise<MatrixRTCModule> =>
  import('matrix-js-sdk/lib/matrixrtc');

/** The room's own call, as Element Call and the call token service name it. */
const ROOM_CALL_SLOT = { application: 'm.call', id: 'ROOM' };

/**
 * Membership timing: valid for an hour, re-published two minutes before it
 * runs out, which browsers' throttled background timers still meet.
 */
// No sticky events (`unstableSendStickyEvents`): with them, our media key
// would belong to a hashed identity instead of `user:device`, which the call
// token is for and which the E2EE worker sends under (see keepDecrypting).
const CALL_SESSION_CONFIG = {
  membershipEventExpiryMs: 60 * 60 * 1000,
  membershipEventExpiryHeadroomMs: 2 * 60 * 1000,
};

type SessionRoom = ConstructorParameters<
  MatrixRTCModule['MatrixRTCSession']
>[1];

/**
 * The room as the call session sees it: its call member state holds only the
 * memberships that are valid now, as parseCallMembers reads them. Any room
 * member can write these events, and the session takes `expires` and
 * `created_ts` as they come.
 */
export function sessionRoom(room: Room): SessionRoom {
  const liveTimeline = {
    getState: (direction: typeof EventTimeline.FORWARDS) => {
      const state = room.getLiveTimeline().getState(direction);
      if (!state) return state;
      return {
        getStateEvents: (type: string, stateKey?: string) => {
          if (type !== CALL_MEMBER_EVENT || stateKey !== undefined) {
            return (state.getStateEvents as any)(type, stateKey);
          }
          const now = Date.now();
          return state
            .getStateEvents(type)
            .filter((event) => isValidCallMemberEvent(event, now));
        },
      };
    },
  };
  const view = {
    roomId: room.roomId,
    getVersion: () => room.getVersion(),
    getLiveTimeline: () => liveTimeline,
    hasMembershipState: (userId: string, membership: string) =>
      room.hasMembershipState(userId, membership),
    _unstable_getStickyEvents: () => room._unstable_getStickyEvents(),
    on: (event: any, listener: any) => {
      room.on(event, listener);
      return view;
    },
    off: (event: any, listener: any) => {
      room.off(event, listener);
      return view;
    },
  };
  return view as unknown as SessionRoom;
}

export interface CallSessionHandle {
  session: CallSession;
  /**
   * Resolves when the session gives up on our membership for good, e.g.
   * after repeated network errors; other members then see us leave.
   */
  lost: Promise<unknown>;
  /**
   * Resolves once our membership is published; rejects if it can't be, or
   * when the call is left first.
   */
  joined: Promise<void>;
  /** Withdraws our membership, within `timeoutMs`, and stops the session. */
  leave: (timeoutMs: number) => Promise<void>;
}

/**
 * Joins the room's call as this device with matrix-js-sdk's MatrixRTC
 * session, which publishes and refreshes the call membership as Element Call
 * does. The session is our own rather than the client's `matrixRTC` one, so
 * that it reads only valid memberships and takes only authentic media keys.
 * With `encrypt`, it also exchanges media keys with the other members:
 * Olm-encrypted to every device with a call membership, rotated when one
 * leaves.
 */
export async function joinCallSession(
  client: MatrixClient,
  room: Room,
  foci: { type: string }[],
  { encrypt = false }: { encrypt?: boolean } = {},
): Promise<CallSessionHandle> {
  const {
    MatrixRTCSession,
    MembershipManagerEvent,
    MatrixRTCSessionEvent,
    Status,
  } = await loadMatrixRTC();
  const session = new MatrixRTCSession(
    keyGatedClient(client, room.roomId),
    sessionRoom(room),
    {
      ...ROOM_CALL_SLOT,
    },
    { listenForStickyEvents: false, listenForMemberStateEvents: true },
  );

  // A standalone session re-reads the call's memberships only for slot
  // events; the client's session manager feeds it member events otherwise.
  // Without that it would not see our own membership land, nor repair it.
  const onStateEvent = (event: MatrixEvent) => {
    if (
      event.getRoomId() === room.roomId &&
      event.getType() === CALL_MEMBER_EVENT
    ) {
      void session.ensureRecalculateSessionMembers();
    }
  };
  client.on(RoomStateEvent.Events, onStateEvent);

  const userId = client.getUserId() || '';
  const deviceId = client.getDeviceId() || '';
  // The session withdraws the membership when the call is left, but nothing
  // runs when the tab closes: leave from pagehide with a request that
  // outlives the page, or other members see this device in the call until
  // the membership expires, an hour later. From the moment of joining, as
  // the membership may land while the call is still being set up.
  const stateKey = makeCallMemberStateKey(userId, deviceId, room.getVersion());
  const onPageHide = () => sendLeaveOnUnload(client, room.roomId, stateKey);
  window.addEventListener('pagehide', onPageHide);

  let settleJoin: (error?: unknown) => void = () => undefined;
  const joined = new Promise<void>((resolve, reject) => {
    settleJoin = (error) => {
      session.off(MembershipManagerEvent.StatusChanged, onStatus);
      if (error) reject(error);
      else resolve();
    };
    const onStatus = (_previous: string, status: string) => {
      if (status === Status.Connected) settleJoin();
    };
    session.on(MembershipManagerEvent.StatusChanged, onStatus);
  });
  // A caller that stops waiting must not leave the rejection unhandled.
  joined.catch(() => undefined);

  let markLost: (error: unknown) => void = () => undefined;
  const lost = new Promise<unknown>((resolve) => (markLost = resolve));
  const onError = (error: unknown) => {
    settleJoin(error);
    markLost(error);
  };
  session.on(MatrixRTCSessionEvent.MembershipManagerError, onError);

  let leaving: Promise<void> | null = null;
  const leave = (timeoutMs: number) => {
    settleJoin(new Error('Left the call'));
    leaving ??= (async () => {
      // A session whose membership manager gave up counts as not joined, and
      // leaving it would skip the key transport it started.
      if (!session.isJoined()) (session as any).encryptionManager?.leave?.();
      await session.leaveRoomSession(timeoutMs).catch(() => false);
      client.removeListener(RoomStateEvent.Events, onStateEvent);
      window.removeEventListener('pagehide', onPageHide);
      session.off(MatrixRTCSessionEvent.MembershipManagerError, onError);
      await session.stop();
    })().catch(() => undefined);
    return leaving;
  };

  try {
    session.joinRTCSession(
      { userId, deviceId, memberId: `${userId}:${deviceId}` },
      foci as any,
      undefined,
      { ...CALL_SESSION_CONFIG, manageMediaKeys: encrypt },
    );
  } catch (error) {
    void leave(1000);
    throw error;
  }

  return { session, joined, lost, leave };
}
