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

import { getCallDeviceId } from './callMembership';
import { MatrixCallContext } from './MatrixCallContext';
import { findActiveFocus } from './parseCallMembers';
import { CallSessionHandle, joinCallSession } from './rtcSession';
import { CallState, LiveKitCredentials } from './types';
import { useCallMemberEvents } from './useCallMemberEvents';
import { useLiveKitToken } from './useLiveKitToken';

// LiveKit silently retries an unreachable SFU instead of failing, so a call
// that never reaches `connected` would sit on the spinner forever. Bound the
// attempt and surface it as a dismissible error.
export const CALL_CONNECT_TIMEOUT_MS = 15_000;
// How long a leave waits for the membership to be withdrawn.
const CALL_LEAVE_TIMEOUT_MS = 5_000;

const withTimeout = <T,>(promise: Promise<T>, ms: number): Promise<T> =>
  new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Timed out')), ms);
    promise.then(resolve, reject).finally(() => clearTimeout(timer));
  });

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
  // The MatrixRTC session of the current call, which owns our membership.
  const sessionRef = useRef<CallSessionHandle | null>(null);
  // The last leave, so that a new call publishes after it has landed.
  const leavingRef = useRef<Promise<unknown>>(Promise.resolve());

  const leaveSession = useCallback(() => {
    const handle = sessionRef.current;
    sessionRef.current = null;
    if (handle) leavingRef.current = handle.leave(CALL_LEAVE_TIMEOUT_MS);
  }, []);

  // While in a call, watch the call room's members (used by the call view's
  // identity map). Outside a call, watch the active room so the "others on
  // call here" banner can light up.
  const watchedRoomId = callRoomId || activeRoomId;
  const watchedRoomUuid = callRoomUuid || activeRoomUuid;
  const { callMembers } = useCallMemberEvents(watchedRoomId, watchedRoomUuid);

  // Bumped by endCall so an in-flight startCall (awaiting a token) can detect
  // it was cancelled and abort before joining the call or using a token.
  const callGenerationRef = useRef(0);

  useEffect(() => {
    if (connectionState === 'connected') {
      discover();
    }
  }, [connectionState, discover]);

  const endCall = useCallback(
    (errorMessage?: string) => {
      // Invalidate any in-flight startCall awaiting a token so it won't publish.
      callGenerationRef.current++;
      leaveSession();
      inCallRef.current = false;
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
    [leaveSession],
  );

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
    // A call already running is left, not orphaned by the new one.
    leaveSession();
    setCallRoomId(targetRoomId);
    setCallRoomUuid(targetRoomUuid);
    setCallState('discovering');
    setError(null);

    // From here on, a logout or the session ending cancels this start.
    inCallRef.current = true;
    const fail = () => {
      // Nothing of this attempt, such as a late lost membership, may replace
      // the error below.
      callGenerationRef.current++;
      inCallRef.current = false;
      leaveSession();
      setCallState('error');
      setError(translate('Could not connect to the call.'));
    };

    // Publish the membership first: the call token is only issued for a
    // device that is a member of the room's call.
    const room = client.getRoom?.(targetRoomId);
    const deviceId = getCallDeviceId(client);
    // Who is in the call already decides its focus; read it before our own
    // membership lands, which would otherwise be the oldest to a slow sync.
    const activeFocus = findActiveFocus(room, Date.now(), {
      userId: client.getUserId?.() || '',
      deviceId,
    });
    const ownFocus = await getFocus(targetRoomId);
    if (callGenerationRef.current !== generation) return;
    if (!room) {
      fail();
      return;
    }
    // A membership withdrawn just before must not land after the new one.
    await leavingRef.current;
    if (callGenerationRef.current !== generation) return;
    let handle: CallSessionHandle;
    try {
      handle = await joinCallSession(client, room, ownFocus ? [ownFocus] : []);
    } catch {
      if (callGenerationRef.current === generation) fail();
      return;
    }
    if (callGenerationRef.current !== generation) {
      // endCall ran while the session was loading, before it could leave it.
      leavingRef.current = handle.leave(CALL_LEAVE_TIMEOUT_MS);
      return;
    }
    sessionRef.current = handle;
    try {
      await withTimeout(handle.joined, CALL_CONNECT_TIMEOUT_MS);
    } catch {
      if (callGenerationRef.current === generation) fail();
      return;
    }
    // Bail if endCall ran (or another startCall superseded us) meanwhile;
    // endCall has already left the session above.
    if (callGenerationRef.current !== generation) return;
    // Should the session give up on the membership later, the others no
    // longer see this device in the call: end it here too.
    handle.lost.then(() => {
      if (callGenerationRef.current === generation) {
        endCall(translate('The call was disconnected.'));
      }
    });

    const creds = await acquireToken(targetRoomId, activeFocus);
    if (callGenerationRef.current !== generation) return;
    if (!creds) {
      // Withdraw the membership published above. Stay anchored to the room so
      // the error panel docks in place; the raw token/SFU failure stays in the
      // network response, never shown to the user.
      fail();
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
    leaveSession,
    endCall,
  ]);

  const markConnected = useCallback(() => {
    if (!inCallRef.current) return;
    setCallState('connected');
  }, []);

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
      // At app teardown the matrix-js-sdk client may already be stopped; the
      // leave is best effort and never rejects.
      callGenerationRef.current++;
      leaveSession();
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
