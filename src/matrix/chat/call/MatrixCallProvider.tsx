import { MatrixEvent, RoomStateEvent } from 'matrix-js-sdk';
import {
  FC,
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { translate } from '@/i18n';
import { useUser } from '@/workspace/hooks';

import { useMatrixClient } from '../useMatrixClient';

import {
  CALL_MEMBER_EVENT,
  CallMembershipTiming,
  getCallDeviceId,
  LiveKitFocus,
  MEMBERSHIP_EXPIRY_MS,
  sendLeaveOnUnload,
  startMembershipRefresh,
} from './callMembership';
import { MatrixCallContext } from './MatrixCallContext';
import { findActiveFocus } from './parseCallMembers';
import { CallState, LiveKitCredentials } from './types';
import {
  announceCallJoin,
  announceCallLeave,
  getCallMemberStateKey,
  useCallMemberEvents,
} from './useCallMemberEvents';
import { useLiveKitToken } from './useLiveKitToken';

// LiveKit silently retries an unreachable SFU instead of failing, so a call
// that never reaches `connected` would sit on the spinner forever. Bound the
// attempt and surface it as a dismissible error.
export const CALL_CONNECT_TIMEOUT_MS = 15_000;

export const MatrixCallProvider: FC<PropsWithChildren> = ({ children }) => {
  const { client, activeRoomId, activeRoomUuid, connectionState } =
    useMatrixClient();
  const { rtcAvailable, discover, getFocus, acquireToken } = useLiveKitToken();
  const user = useUser();

  const [callState, setCallState] = useState<CallState>('idle');
  const [credentials, setCredentials] = useState<LiveKitCredentials | null>(
    null,
  );
  const [callRoomId, setCallRoomId] = useState<string | null>(null);
  const [callRoomUuid, setCallRoomUuid] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inCallRef = useRef(false);
  // The published membership of the current call: join time and validity.
  const membershipRef = useRef<CallMembershipTiming | null>(null);
  // The foci the published membership advertises; kept for re-publishing.
  const fociRef = useRef<LiveKitFocus[]>([]);
  const announceLockRef = useRef<Promise<unknown>>(Promise.resolve());

  const queueAnnounce = useCallback(
    (work: () => Promise<unknown>): Promise<unknown> => {
      const next = announceLockRef.current.then(work, work);
      announceLockRef.current = next.catch(() => undefined);
      return next;
    },
    [],
  );

  // While in a call, watch the call room's members (used by the call view's
  // identity map). Outside a call, watch the active room so the "others on
  // call here" banner can light up. Refs hold the latest client + call room
  // so the unmount cleanup can leave the right room without re-firing every
  // time activeRoomId changes.
  const watchedRoomId = callRoomId || activeRoomId;
  const watchedRoomUuid = callRoomUuid || activeRoomUuid;
  const { callMembers } = useCallMemberEvents(watchedRoomId, watchedRoomUuid);

  const clientRef = useRef(client);
  const callRoomIdRef = useRef<string | null>(null);
  // Bumped by endCall so an in-flight startCall (awaiting a token) can detect
  // it was cancelled and abort before publishing a call membership. Synchronous
  // — unlike callRoomIdRef, which is effect-synced and lags behind the await.
  const callGenerationRef = useRef(0);
  useEffect(() => {
    clientRef.current = client;
  }, [client]);
  useEffect(() => {
    callRoomIdRef.current = callRoomId;
  }, [callRoomId]);

  useEffect(() => {
    if (connectionState === 'connected') {
      discover();
    }
  }, [connectionState, discover]);

  const startCall = useCallback(async () => {
    if (!activeRoomId) {
      setError('No active room');
      return;
    }
    if (!client) {
      setError('Matrix client not connected');
      return;
    }

    const targetRoomId = activeRoomId;
    const targetRoomUuid = activeRoomUuid;
    const generation = ++callGenerationRef.current;
    setCallRoomId(targetRoomId);
    setCallRoomUuid(targetRoomUuid);
    setCallState('discovering');
    setError(null);

    // Publish the membership first: the call token is only issued for a
    // device that is a member of the room's call.
    const deviceId = getCallDeviceId(client);
    // Who is in the call already decides its focus; read it before our own
    // membership lands, which would otherwise be the oldest to a slow sync.
    const activeFocus = findActiveFocus(
      client.getRoom?.(targetRoomId),
      Date.now(),
      { userId: client.getUserId?.() || '', deviceId },
    );
    const ownFocus = await getFocus(targetRoomId);
    if (callGenerationRef.current !== generation) return;
    const foci = ownFocus ? [ownFocus] : [];
    fociRef.current = foci;
    const timing = { createdTs: Date.now(), expires: MEMBERSHIP_EXPIRY_MS };
    membershipRef.current = timing;
    inCallRef.current = true;
    try {
      await queueAnnounce(() =>
        announceCallJoin(client, targetRoomId, deviceId, timing, foci),
      );
    } catch {
      if (callGenerationRef.current !== generation) return;
      inCallRef.current = false;
      membershipRef.current = null;
      setCallState('error');
      setError(translate('Could not connect to the call.'));
      return;
    }
    // Bail if endCall ran (or another startCall superseded us) meanwhile;
    // endCall has already queued the leave for the membership above.
    if (callGenerationRef.current !== generation) return;

    const creds = await acquireToken(targetRoomId, activeFocus);
    if (callGenerationRef.current !== generation) return;
    if (!creds) {
      // Withdraw the membership published above. Stay anchored to the room so
      // the error panel docks in place; the raw token/SFU failure stays in the
      // network response, never shown to the user.
      inCallRef.current = false;
      membershipRef.current = null;
      queueAnnounce(() =>
        announceCallLeave(client, targetRoomId, deviceId),
      ).catch(() => undefined);
      setCallState('error');
      setError(translate('Could not connect to the call.'));
      return;
    }

    setCredentials(creds);
    setCallState('connecting');
  }, [
    activeRoomId,
    activeRoomUuid,
    client,
    getFocus,
    acquireToken,
    queueAnnounce,
  ]);

  const endCall = useCallback(
    (errorMessage?: string) => {
      // Invalidate any in-flight startCall awaiting a token so it won't publish.
      callGenerationRef.current++;
      const roomId = callRoomIdRef.current;
      if (inCallRef.current && clientRef.current && roomId) {
        queueAnnounce(() =>
          announceCallLeave(
            clientRef.current,
            roomId,
            getCallDeviceId(clientRef.current),
          ),
        );
      }
      inCallRef.current = false;
      membershipRef.current = null;
      setCredentials(null);
      setCallState(errorMessage ? 'error' : 'idle');
      // An errored call stays anchored to its room so the panel docks there; a
      // clean hang-up clears the anchor and returns to idle.
      if (!errorMessage) {
        setCallRoomId(null);
        setCallRoomUuid(null);
      }
      setError(errorMessage ?? null);
    },
    [queueAnnounce],
  );

  const markConnected = useCallback(() => {
    if (!inCallRef.current) return;
    setCallState('connected');
  }, []);

  // Keep the membership alive for as long as the call runs: re-publish it once,
  // shortly before it expires, rather than on a heartbeat. Each publish is a
  // room state event, so a heartbeat floods the room's history.
  const inCall = callState === 'connecting' || callState === 'connected';
  useEffect(() => {
    if (!inCall || !client || !callRoomId || !membershipRef.current) return;
    const deviceId = getCallDeviceId(client);
    const stateKey = getCallMemberStateKey(client, callRoomId, deviceId);
    const stop = startMembershipRefresh(membershipRef.current, (timing) =>
      queueAnnounce(() =>
        announceCallJoin(client, callRoomId, deviceId, timing, fociRef.current),
      ).then(() => {
        if (membershipRef.current) membershipRef.current = timing;
      }),
    );
    // React cleanup does not run when the tab closes; leave from pagehide so
    // other members don't see this device in the call until it expires.
    const onPageHide = () => sendLeaveOnUnload(client, callRoomId, stateKey);
    window.addEventListener('pagehide', onPageHide);
    // Outside rooms with owned state keys (MSC3757) any member allowed to send
    // call.member events can overwrite this device's key, e.g. with `{}`. If
    // someone else does while we are in the call, publish ours again.
    const myUserId = client.getUserId?.();
    const onStateEvent = (event: MatrixEvent) => {
      if (
        event.getRoomId() !== callRoomId ||
        event.getType() !== CALL_MEMBER_EVENT ||
        event.getStateKey() !== stateKey ||
        event.getSender() === myUserId
      ) {
        return;
      }
      const timing = membershipRef.current;
      if (!timing) return;
      queueAnnounce(() =>
        announceCallJoin(client, callRoomId, deviceId, timing, fociRef.current),
      ).catch(() => undefined);
    };
    client.on?.(RoomStateEvent.Events, onStateEvent);
    return () => {
      stop();
      window.removeEventListener('pagehide', onPageHide);
      client.removeListener?.(RoomStateEvent.Events, onStateEvent);
    };
  }, [client, callRoomId, inCall, queueAnnounce]);

  useEffect(() => {
    if (callState !== 'connecting') return;
    const timer = setTimeout(() => {
      endCall(translate('Could not connect to the call.'));
    }, CALL_CONNECT_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [callState, endCall]);

  // Unmount-only cleanup. Deps must stay empty so it doesn't fire on every
  // room/client change — the refs above carry the latest values.
  useEffect(() => {
    return () => {
      if (inCallRef.current && clientRef.current && callRoomIdRef.current) {
        // At app teardown the matrix-js-sdk client may already be stopped;
        // swallow the rejection so it doesn't surface as an unhandled
        // promise during logout / page navigation.
        queueAnnounce(() =>
          announceCallLeave(
            clientRef.current,
            callRoomIdRef.current!,
            getCallDeviceId(clientRef.current),
          ),
        ).catch(() => undefined);
      }
    };
  }, []);

  // An ended chat session takes the client with it, so the call could neither
  // keep its membership alive nor announce leaving; end it with the session
  // rather than leave media running in the floating widget.
  useEffect(() => {
    if (connectionState === 'ended' && inCallRef.current) endCall();
  }, [connectionState, endCall]);

  // Leave the call on Waldur logout / user switch. MatrixRoot keeps this
  // provider mounted across auth changes (so `children` never remounts), so the
  // unmount cleanup above won't fire on logout — mirror MatrixChatProvider's
  // user-watching teardown. This provider is nested inside MatrixChatProvider,
  // so its effect runs first (child before parent): endCall still has a live
  // client to announce the leave through before the chat provider disconnects.
  const userUuidRef = useRef(user?.uuid);
  useEffect(() => {
    const newUuid = user?.uuid ?? null;
    if (userUuidRef.current !== newUuid) {
      userUuidRef.current = newUuid;
      if (inCallRef.current) {
        endCall();
      }
    }
  }, [user?.uuid, endCall]);

  const contextValue = useMemo(
    () => ({
      callState,
      credentials,
      callMembers,
      callRoomId,
      callRoomUuid,
      rtcAvailable,
      error,
      startCall,
      endCall,
      markConnected,
    }),
    [
      callState,
      credentials,
      callMembers,
      callRoomId,
      callRoomUuid,
      rtcAvailable,
      error,
      startCall,
      endCall,
      markConnected,
    ],
  );

  return (
    <MatrixCallContext.Provider value={contextValue}>
      {children}
    </MatrixCallContext.Provider>
  );
};
