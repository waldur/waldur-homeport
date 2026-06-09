import {
  createContext,
  FC,
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { matrixCredentialsRetrieve } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useUser } from '@/workspace/hooks';

import { getMatrixErrorMessage } from './matrixErrorMessage';
import { MatrixChatContextValue, MatrixConnectionState } from './types';

// Logger passed to createClient so the SDK's per-client paths
// (FetchHttpApi, sync, queue, etc.) don't spam the console.
const noop = () => {};
const quietMatrixLogger: any = {
  trace: noop,
  debug: noop,
  info: noop,
  warn: noop,
  error: noop,
  getChild() {
    return quietMatrixLogger;
  },
};

// matrix-js-sdk submodules (GroupCallEventHandler, MatrixRTCSession,
// PushProcessor, ...) import a global `loglevel`-backed logger directly,
// bypassing the per-client `logger` option. Each loglevel logger caches
// its own methodFactory at creation, and the SDK's `getChild` propagates
// the parent's factory into children — so we have to both (a) override
// the global factory for any future bare `getLogger` calls, AND
// (b) reach into every existing matrix-* logger and replace its
// per-instance factory, then rebuild.
let matrixLogLevelPatched = false;
async function patchMatrixSdkLoggers() {
  if (matrixLogLevelPatched) return;
  matrixLogLevelPatched = true;
  try {
    const { default: loglevel } = await import('loglevel');

    const shouldSilence = (methodName: string, loggerName: unknown) => {
      const name = typeof loggerName === 'string' ? loggerName : '';
      // Anything below error from matrix-* loggers is noise: push rule
      // bootstrap warnings, "Legacy event found" per-sync chatter, etc.
      // Real failures still hit `error`.
      return (
        name.startsWith('matrix') &&
        (methodName === 'trace' ||
          methodName === 'debug' ||
          methodName === 'info' ||
          methodName === 'warn')
      );
    };

    const previousGlobalFactory = loglevel.methodFactory;

    loglevel.methodFactory = (methodName: any, level: any, loggerName: any) => {
      if (shouldSilence(methodName, loggerName)) return noop;
      return previousGlobalFactory(methodName, level, loggerName);
    };

    // Replace methodFactory on already-created matrix loggers so their
    // own bindings (and any children that copy from them) get filtered.
    const existing = loglevel.getLoggers();
    for (const name of Object.keys(existing)) {
      if (name === 'matrix' || name.startsWith('matrix')) {
        const lg = existing[name] as any;
        const parentFactory = lg.methodFactory;
        lg.methodFactory = (methodName: any, level: any, loggerName: any) => {
          if (shouldSilence(methodName, loggerName)) return noop;
          return parentFactory(methodName, level, loggerName);
        };
        if (typeof lg.rebuild === 'function') {
          lg.rebuild();
        } else {
          lg.setLevel(lg.getLevel());
        }
      }
    }
  } catch {
    // loglevel is a transitive dep of matrix-js-sdk; if it ever stops
    // being reachable, fall back to the per-client logger only.
  }
}

export const MatrixChatContext = createContext<MatrixChatContextValue>({
  client: null,
  connectionState: 'idle',
  activeRoomId: null,
  activeRoomUuid: null,
  userId: null,
  connect: async () => {},
  disconnect: () => {},
  error: null,
  roomAccessDenied: false,
});

export const MatrixChatProvider: FC<PropsWithChildren> = ({ children }) => {
  const clientRef = useRef<any>(null);
  // Hold the live onSync handler so disconnect() / unmount can detach it.
  // matrix-js-sdk never auto-removes listeners on stopClient(), so a missing
  // removeListener leaks the closure + the React setState bindings every
  // time we reconnect (each call adds a new handler on top).
  const onSyncRef = useRef<((state: string) => void) | null>(null);
  // Synchronous latch covering the window between the start of connect() and
  // clientRef being assigned. `connectionState` is React state and updates
  // asynchronously, so two consumers (the global chat drawer and the project
  // Communication panel both mount against this single provider) can call
  // connect() in the same tick, both observe 'idle', and both create a client.
  const connectingRef = useRef(false);
  const [connectionState, setConnectionState] =
    useState<MatrixConnectionState>('idle');
  // Mirror connectionState onto a ref so `connect`'s useCallback identity
  // is stable across state transitions. The previous setup re-created
  // `connect` on every state flip; downstream effects that capture it
  // (MatrixChatDrawer's "switch room on activeRoomUuid change") would then
  // see stale closures or trigger spurious re-runs.
  const connectionStateRef = useRef<MatrixConnectionState>('idle');
  useEffect(() => {
    connectionStateRef.current = connectionState;
  }, [connectionState]);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [activeRoomUuid, setActiveRoomUuid] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [roomAccessDenied, setRoomAccessDenied] = useState(false);

  const user = useUser();
  const currentUserUuidRef = useRef<string | null | undefined>(user?.uuid);

  const disconnect = useCallback(() => {
    if (clientRef.current) {
      try {
        if (onSyncRef.current) {
          // Best-effort: SDK versions differ on listener removal APIs.
          // Match the registration in `connect`.

          (clientRef.current as any).removeListener?.(
            'sync',
            onSyncRef.current,
          );
          onSyncRef.current = null;
        }
        clientRef.current.stopClient();
        // Defensive: any remaining handlers from sub-modules (calls,
        // presence, etc.) are torn down here so a fresh login doesn't
        // inherit them.
        clientRef.current.removeAllListeners?.();
      } catch {
        // best-effort teardown — we're discarding the client anyway
      }
      clientRef.current = null;
    }
    connectingRef.current = false;
    setConnectionState('disconnected');
    setActiveRoomId(null);
    setActiveRoomUuid(null);
    setUserId(null);
    setError(null);
    setRoomAccessDenied(false);
  }, []);

  // Tear down on Waldur logout / user switch. AuthService.clearAuthCache
  // dispatches setCurrentUser(undefined); we listen on the resulting Redux
  // state. If we didn't, the matrix-js-sdk client would keep syncing with
  // the previous user's access token, and a fresh login on the same browser
  // would mount this provider on top of a live old session.
  useEffect(() => {
    const newUuid = user?.uuid ?? null;
    if (currentUserUuidRef.current !== newUuid) {
      currentUserUuidRef.current = newUuid;
      if (clientRef.current) {
        disconnect();
      }
    }
  }, [user?.uuid, disconnect]);

  const connect = useCallback(
    async (roomUuid: string, options?: { activate?: boolean }) => {
      // `activate: false` bootstraps the synced client for app-wide unread
      // counts (the header bullet) without focusing a room. Focusing a room
      // auto-marks it read once its messages render, so a silent bootstrap
      // must NOT set the active room — otherwise opening the drawer later
      // would mark a room the user never selected as read.
      const activate = options?.activate !== false;

      // A client already exists (still doing its initial sync, or fully
      // connected). Never create a second one — both the global chat drawer
      // and the project Communication panel consume this same provider and
      // each call connect() on mount.
      if (clientRef.current) {
        // A bootstrap request once a client exists is a no-op — the sync is
        // already running and we must not steal focus from the active room.
        if (!activate) return;
        if (connectionStateRef.current === 'connected') {
          // Lightweight room switch on the live client.
          try {
            const res = await matrixCredentialsRetrieve({
              query: { room_uuid: roomUuid },
            } as any);
            const data = res.data as any;
            if (data.room_id) {
              // Flip both together so consumers never see the id and uuid
              // disagree mid-switch.
              setActiveRoomId(data.room_id);
              setActiveRoomUuid(roomUuid);
              setRoomAccessDenied(false);
              setError(null);
            } else {
              // Room resolved but the backend withheld conversation access:
              // the caller can see/manage the room but is not a member.
              setRoomAccessDenied(true);
            }
          } catch (e) {
            setError(
              getMatrixErrorMessage(
                e,
                translate('Could not open the conversation. Please try again.'),
              ),
            );
          }
        }
        // Still connecting: the consumer's own effect re-runs connect() once
        // connectionState flips to 'connected', and the switch happens then.
        return;
      }

      // A connect() is already in flight but hasn't assigned clientRef yet.
      // Bail synchronously so a concurrent caller can't create a second
      // client (which would stopClient() the first and strand the panel on a
      // dead, never-syncing client).
      if (connectingRef.current) return;
      connectingRef.current = true;

      setConnectionState('connecting');
      setError(null);

      try {
        const res = await matrixCredentialsRetrieve({
          query: { room_uuid: roomUuid },
        } as any);
        const credentials = res.data;

        const creds = credentials as any;

        // The backend always returns an access_token when room_uuid is
        // provided, regardless of the configured login method.
        const accessToken: string | undefined =
          creds.access_token || credentials.login_token;

        if (!accessToken) {
          throw new Error(
            'No access token available. Please use an external Matrix client.',
          );
        }

        // Dynamic import of matrix-js-sdk — zero main bundle impact
        const sdk = await import('matrix-js-sdk');
        await patchMatrixSdkLoggers();

        // Explicit MemoryStore: matrix-js-sdk 40.x currently defaults to
        // an in-memory store, but a future bump that flips to IndexedDB
        // would silently persist tokens and message history past Waldur
        // logout. Pin the store so the contract is local-and-ephemeral.

        const Store = (sdk as any).MemoryStore;
        const client = sdk.createClient({
          baseUrl: credentials.homeserver_url,
          accessToken,
          userId: credentials.matrix_user_id,
          // Silence the SDK's verbose FetchHttpApi/sync debug logs.
          // Keep warn/error so real problems still surface.
          logger: quietMatrixLogger,
          ...(Store ? { store: new Store({ localStorage: undefined }) } : {}),
        });

        // Disable TURN server polling — not needed for text chat,
        // and Tuwunel doesn't implement the endpoint. Feature-detect so
        // an SDK rename of the method doesn't silently re-enable polling
        // — we'd notice the assignment crash here.
        if (typeof (client as any).checkTurnServers === 'function') {
          // eslint-disable-next-line require-await
          (client as any).checkTurnServers = async () => false;
        }

        // Defensive: if a previous client somehow survived (re-mount during a
        // failed connect), stop it before overwriting the ref.
        if (clientRef.current) {
          try {
            clientRef.current.stopClient();
          } catch {
            // best-effort cleanup; a stale client failing to stop is harmless
          }
        }
        clientRef.current = client;
        // Client assigned — the duplicate-creation window is closed; further
        // connect() calls are now gated by the clientRef.current guard above.
        connectingRef.current = false;
        setUserId(credentials.matrix_user_id);

        // Set room_id from credentials response — only when activating. A
        // silent bootstrap leaves the active room null so nothing is focused
        // (and thus nothing is auto-marked-read) until the user opens a room.
        if (activate) {
          if ((credentials as any).room_id) {
            setActiveRoomId((credentials as any).room_id);
            setActiveRoomUuid(roomUuid);
            setRoomAccessDenied(false);
          } else {
            // Room resolved but no conversation access — the user can
            // see/manage the room but is not a member of the chat (e.g. staff,
            // non-member owner). The panel surfaces a "not a member" state.
            setRoomAccessDenied(true);
          }
        }

        // Auto-join only matters for the room we're focusing; a bootstrap
        // connects against a room the user is already a member of.
        const roomId = activate ? (credentials as any).room_id : null;

        // Listen for sync state using SDK's own event enum
        const onSync = async (state: string) => {
          if (state === 'PREPARED' || state === 'SYNCING') {
            // Auto-join the room if we're only invited (not yet joined).
            // The backend should have already joined us via the appservice,
            // but this is a fallback in case the join hasn't propagated yet.
            if (roomId) {
              try {
                const room = client.getRoom(roomId);
                const membership = room?.getMyMembership?.();
                if (!room || membership === 'invite') {
                  await client.joinRoom(roomId);
                }
              } catch {
                // If this is the first sync and we failed to join,
                // we cannot proceed — the user is not in the room.
                if (state === 'PREPARED') {
                  setConnectionState('error');
                  setError(translate('Could not join the conversation.'));
                  return;
                }
              }
            }

            setConnectionState('connected');
          } else if (state === 'ERROR') {
            setConnectionState('error');
            setError(translate('Connection lost, reconnecting...'));
          }
        };

        onSyncRef.current = onSync;
        client.on(sdk.ClientEvent.Sync, onSync);

        client.startClient({ initialSyncLimit: 30 });
      } catch (e) {
        // Failed before clientRef was assigned — release the latch so a
        // later connect() (e.g. user retry) can try again.
        connectingRef.current = false;
        setConnectionState('error');
        // Surface a friendly message for the 429 rate-limit (so the user knows
        // to wait rather than retrying into the throttle); fall back to the
        // generic message for native/network errors that carry no detail.
        setError(
          getMatrixErrorMessage(
            e,
            translate(
              'Could not connect to the chat server. Please try again.',
            ),
          ),
        );
      }
    },
    // Empty deps: connectionState is read via connectionStateRef so this
    // callback identity is stable across state transitions. Consumers can
    // safely treat `connect` as referentially stable.
    [],
  );

  // Cleanup on unmount — funnel through disconnect() so the onSync listener
  // is detached and the React state is reset on the way out.
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  const contextValue = useMemo(
    () => ({
      client: clientRef.current,
      connectionState,
      activeRoomId,
      activeRoomUuid,
      userId,
      connect,
      disconnect,
      error,
      roomAccessDenied,
    }),
    [
      connectionState,
      activeRoomId,
      activeRoomUuid,
      userId,
      connect,
      disconnect,
      error,
      roomAccessDenied,
    ],
  );

  return (
    <MatrixChatContext.Provider value={contextValue}>
      {children}
    </MatrixChatContext.Provider>
  );
};
