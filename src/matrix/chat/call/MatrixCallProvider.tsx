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

import { useMatrixClient } from '../useMatrixClient';

import { MatrixCallContext } from './MatrixCallContext';
import { CallState, LiveKitCredentials } from './types';
import {
  announceCallJoin,
  announceCallLeave,
  CALL_MEMBER_REFRESH_MS,
  useCallMemberEvents,
} from './useCallMemberEvents';
import { useLiveKitToken } from './useLiveKitToken';

const DEVICE_ID_KEY = 'waldur_matrix_device_id';

// LiveKit silently retries an unreachable SFU instead of failing, so a call
// that never reaches `connected` would sit on the spinner forever. Bound the
// attempt and surface it as a dismissible error.
export const CALL_CONNECT_TIMEOUT_MS = 15_000;

function getDeviceId(): string {
  return sessionStorage.getItem(DEVICE_ID_KEY) || '';
}

export const MatrixCallProvider: FC<PropsWithChildren> = ({ children }) => {
  const { client, activeRoomId, activeRoomUuid, connectionState } =
    useMatrixClient();
  const { rtcAvailable, discover, acquireToken } = useLiveKitToken();

  const [callState, setCallState] = useState<CallState>('idle');
  const [credentials, setCredentials] = useState<LiveKitCredentials | null>(
    null,
  );
  const [callRoomId, setCallRoomId] = useState<string | null>(null);
  const [callRoomUuid, setCallRoomUuid] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inCallRef = useRef(false);
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

    const creds = await acquireToken(targetRoomId);
    // Bail if endCall ran (or another startCall superseded us) while the token
    // was in flight — otherwise we'd publish a call membership the user's own
    // UI no longer reflects.
    if (callGenerationRef.current !== generation) {
      return;
    }
    if (!creds) {
      // Stay anchored to the room so the error panel docks in place; the raw
      // token/SFU failure stays in the network response, never shown to the user.
      setCallState('error');
      setError(translate('Could not connect to the call.'));
      return;
    }

    setCredentials(creds);
    setCallState('connecting');
    inCallRef.current = true;

    await queueAnnounce(() =>
      announceCallJoin(client, targetRoomId, getDeviceId()),
    );
  }, [activeRoomId, activeRoomUuid, client, acquireToken]);

  const endCall = useCallback(
    (errorMessage?: string) => {
      // Invalidate any in-flight startCall awaiting a token so it won't publish.
      callGenerationRef.current++;
      const roomId = callRoomIdRef.current;
      if (inCallRef.current && clientRef.current && roomId) {
        queueAnnounce(() => announceCallLeave(clientRef.current, roomId));
      }
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
    [queueAnnounce],
  );

  const markConnected = useCallback(() => {
    if (!inCallRef.current) return;
    setCallState('connected');
  }, []);

  // MEMBERSHIP_EXPIRY_MS is short so stale tabs drop quickly. While we're
  // actually connected, re-publish the membership so it doesn't expire on us.
  useEffect(() => {
    if (callState !== 'connecting' && callState !== 'connected') return;
    if (!client || !callRoomId) return;
    const interval = setInterval(() => {
      queueAnnounce(() =>
        announceCallJoin(client, callRoomId, getDeviceId()),
      ).catch(() => {
        // Best-effort — the next tick will retry.
      });
    }, CALL_MEMBER_REFRESH_MS);
    return () => clearInterval(interval);
  }, [client, callRoomId, callState, queueAnnounce]);

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
          announceCallLeave(clientRef.current, callRoomIdRef.current!),
        ).catch(() => undefined);
      }
    };
  }, []);

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
