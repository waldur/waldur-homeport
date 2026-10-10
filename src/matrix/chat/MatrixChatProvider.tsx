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

import {
  CryptoConflict,
  CryptoSessionEnded,
  CryptoState,
  importRecoveryKey,
  resetEncryption,
  SecretStorageKeyHolder,
  setUpEncryption,
  startCrypto,
} from './crypto';
import { homeserverFetch } from './homeserverFetch';
import { MatrixChatContext } from './MatrixChatContext';
import { getMatrixErrorMessage } from './matrixErrorMessage';
import {
  createTokenRefreshFunction,
  installTokenRefresh,
  openRoom,
  sessionTokens,
  startSession,
} from './session';
import { MatrixConnectionState } from './types';

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

// How long to wait before asking again for the encryption setup lease that
// another window holds, when Waldur gives no Retry-After.
const CRYPTO_LEASE_RETRY_MS = 30_000;
// How long a client's teardown waits for its crypto work before stopping it.
const CRYPTO_STOP_WAIT_MS = 10_000;
// Encryption setup restarts the session at most once in this window, so a
// homeserver that keeps answering inconsistently can't make it loop, minting
// a device each time.
const CRYPTO_RESTART_WINDOW_MS = 60_000;

// A session signed out again this soon after an automatic reconnect ends
// instead: something keeps signing it out, and retrying would only pile up
// homeserver devices.
const SIGN_OUT_RECONNECT_WINDOW_MS = 60_000;

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
  // Read by the sign-out handler, which outlives the render that set it up.
  const activeRoomUuidRef = useRef<string | null>(null);
  useEffect(() => {
    activeRoomUuidRef.current = activeRoomUuid;
  }, [activeRoomUuid]);
  const lastSignOutReconnectRef = useRef(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [roomAccessDenied, setRoomAccessDenied] = useState(false);
  const [cryptoState, setCryptoState] = useState<CryptoState>('off');
  // The client's secret-storage key, and its encryption setup while in flight.
  const keyHolderRef = useRef<SecretStorageKeyHolder | null>(null);
  const cryptoSetupRef = useRef<Promise<unknown> | null>(null);
  const cryptoRetryRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastCryptoRestartRef = useRef(0);

  const user = useUser();
  const currentUserUuidRef = useRef<string | null | undefined>(user?.uuid);

  const releaseClient = useCallback(() => {
    if (cryptoRetryRef.current) {
      clearTimeout(cryptoRetryRef.current);
      cryptoRetryRef.current = null;
    }
    if (clientRef.current) {
      const client = clientRef.current;
      try {
        if (onSyncRef.current) {
          // Best-effort: SDK versions differ on listener removal APIs.
          // Match the registration in `connect`.

          (client as any).removeListener?.('sync', onSyncRef.current);
          onSyncRef.current = null;
        }
      } catch {
        // best-effort teardown — we're discarding the client anyway
      }
      const stop = () => {
        try {
          client.stopClient();
          // Defensive: any remaining handlers from sub-modules (calls,
          // presence, etc.) are torn down here so a fresh login doesn't
          // inherit them.
          client.removeAllListeners?.();
        } catch {
          // best-effort teardown — we're discarding the client anyway
        }
      };
      // Stopping the client frees its crypto machine, and crypto work still
      // running then fails with "null pointer passed to rust". Abort the
      // requests that work waits on, and let it settle (for a bounded time)
      // before stopping: the client must not keep running on its tokens.
      const pending = cryptoSetupRef.current;
      if (pending) {
        try {
          // Stop syncing now: abort() only cancels requests in flight, and the
          // sync loop would carry on with the session's tokens until stop().
          (client as any).syncApi?.stop?.();
          (client as any).http?.abort?.();
        } catch {
          // best effort; the wait below is bounded anyway
        }
        void Promise.race([
          pending.catch(() => undefined),
          new Promise((resolve) => setTimeout(resolve, CRYPTO_STOP_WAIT_MS)),
        ]).finally(stop);
      } else {
        stop();
      }
      clientRef.current = null;
    }
    cryptoSetupRef.current = null;
    keyHolderRef.current = null;
    setCryptoState('off');
    connectingRef.current = false;
  }, []);

  const disconnect = useCallback(() => {
    releaseClient();
    setConnectionState('disconnected');
    setActiveRoomId(null);
    setActiveRoomUuid(null);
    setUserId(null);
    setError(null);
    setRoomAccessDenied(false);
    lastSignOutReconnectRef.current = 0;
  }, [releaseClient]);

  // Waldur refused a new session, or the homeserver signed one out again right
  // after a reconnect. The drawer offers to reconnect.
  const endSession = useCallback(() => {
    releaseClient();
    setConnectionState('ended');
    setActiveRoomId(null);
    setError(null);
  }, [releaseClient]);

  // Tear down on Waldur logout / user switch. AuthService.clearAuthCache
  // dispatches setCurrentUser(undefined); we listen on the resulting Redux
  // state. If we didn't, the matrix-js-sdk client would keep syncing with
  // the previous user's access token, and a fresh login on the same browser
  // would mount this provider on top of a live old session. Signing the
  // session's device out also revokes its tokens; every session has its own
  // device, so other tabs are unaffected. A provider left without a client
  // (an ended or failed session) is reset too, so the next user does not
  // inherit the previous one's state; a cold login from 'idle' is left alone
  // so the background bootstrap still starts.
  useEffect(() => {
    const newUuid = user?.uuid ?? null;
    if (currentUserUuidRef.current !== newUuid) {
      currentUserUuidRef.current = newUuid;
      if (clientRef.current || connectionStateRef.current !== 'idle') {
        clientRef.current?.logout?.(true).catch(() => {
          // Best effort: unrevoked, the access token still expires within
          // minutes and the refresh token once unused for refresh_token_ttl.
        });
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
            const roomId = await openRoom(roomUuid);
            if (roomId) {
              // Flip both together so consumers never see the id and uuid
              // disagree mid-switch.
              setActiveRoomId(roomId);
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

      // Replace the client with one on a new Waldur session, keeping the room
      // the user had open.
      const restartSession = (fallbackRoomUuid: string) => {
        const openRoomUuid = activeRoomUuidRef.current;
        releaseClient();
        setActiveRoomId(null);
        void connect(openRoomUuid ?? fallbackRoomUuid, {
          activate: Boolean(openRoomUuid),
        });
      };

      try {
        // The session comes last: everything that can still fail runs first,
        // so a failure does not leave a homeserver device behind. A silent
        // bootstrap does not focus a room, so it has none to open. The
        // dynamic import keeps matrix-js-sdk out of the main bundle.
        const [sdk, roomId] = await Promise.all([
          import('matrix-js-sdk'),
          activate ? openRoom(roomUuid) : Promise.resolve(null),
        ]);
        await patchMatrixSdkLoggers();
        // Tokens live only in this client's memory: nothing is stored in the
        // browser or on the Waldur side.
        const session = await startSession();
        if (!session) {
          connectingRef.current = false;
          setConnectionState('ended');
          return;
        }

        // Explicit MemoryStore: matrix-js-sdk currently defaults to
        // an in-memory store, but a future bump that flips to IndexedDB
        // would silently persist tokens and message history past Waldur
        // logout. Pin the store so the contract is local-and-ephemeral.

        const Store = (sdk as any).MemoryStore;
        const tokens = sessionTokens(session);
        // The secret-storage key lives in this holder, in memory only, for
        // the life of the client.
        const keyHolder = new SecretStorageKeyHolder();
        const client = sdk.createClient({
          baseUrl: session.homeserver_url,
          userId: session.matrix_user_id,
          deviceId: session.device_id,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          // Silence the SDK's verbose FetchHttpApi/sync debug logs.
          // Keep warn/error so real problems still surface.
          logger: quietMatrixLogger,
          ...(Store ? { store: new Store({ localStorage: undefined }) } : {}),
          cryptoCallbacks: keyHolder.callbacks,
          fetchFn: homeserverFetch,
        });

        const refreshes = installTokenRefresh(
          client,
          createTokenRefreshFunction(
            session.homeserver_url,
            sdk.TokenRefreshLogoutError,
          ),
          sdk.TokenRefreshLogoutError,
          tokens.expiry,
          () => clientRef.current === client,
        );
        if (!refreshes) {
          // eslint-disable-next-line no-console
          console.warn(
            'Matrix chat cannot refresh its tokens and will sign in again when they expire.',
          );
        }

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
        keyHolderRef.current = keyHolder;
        // Client assigned — the duplicate-creation window is closed; further
        // connect() calls are now gated by the clientRef.current guard above.
        connectingRef.current = false;
        setUserId(session.matrix_user_id);

        // Only when activating: a silent bootstrap leaves the active room null
        // so nothing is focused (and thus nothing is auto-marked-read) until
        // the user opens a room.
        if (activate) {
          if (roomId) {
            setActiveRoomId(roomId);
            setActiveRoomUuid(roomUuid);
            setRoomAccessDenied(false);
          } else {
            // Room resolved but no conversation access — the user can
            // see/manage the room but is not a member of the chat (e.g. staff,
            // non-member owner). The panel surfaces a "not a member" state.
            setRoomAccessDenied(true);
          }
        }

        // End-to-end encryption, in memory only. If the browser refuses the
        // crypto WebAssembly (an outdated Content-Security-Policy, say), the
        // client still runs: unencrypted rooms keep working, and encrypted
        // ones refuse to send rather than send in clear.
        let cryptoStarted = false;
        try {
          await startCrypto(client);
          cryptoStarted = true;
          setCryptoState('starting');
        } catch {
          setCryptoState('error');
        }

        // A new session brings the recovery key another window escrowed;
        // allowed once per window so an inconsistent homeserver can't loop it.
        const restartForCrypto = () => {
          const now = Date.now();
          if (now - lastCryptoRestartRef.current < CRYPTO_RESTART_WINDOW_MS) {
            setCryptoState('error');
            return;
          }
          lastCryptoRestartRef.current = now;
          restartSession(roomUuid);
        };

        let cryptoSetupRetried = false;
        const runCryptoSetup = () => {
          if (clientRef.current !== client) return;
          const setup = setUpEncryption(client, session, keyHolder)
            .then((state) => {
              if (clientRef.current !== client) return;
              if (
                state === 'locked' &&
                cryptoSetupRetried &&
                !session.recovery_key
              ) {
                // Another window set encryption up while this one waited;
                // this session predates its key.
                restartForCrypto();
                return;
              }
              setCryptoState(state);
            })
            .catch((e) => {
              if (clientRef.current !== client) return;
              if (e instanceof CryptoConflict && e.state === 'in_progress') {
                // Another window is setting encryption up; ask again after.
                cryptoSetupRetried = true;
                cryptoRetryRef.current = setTimeout(
                  runCryptoSetup,
                  e.retryAfterSeconds
                    ? e.retryAfterSeconds * 1000
                    : CRYPTO_LEASE_RETRY_MS,
                );
                return;
              }
              if (e instanceof CryptoConflict && e.state === 'set_up') {
                // Another window finished setting up; its key comes with a
                // new session.
                restartForCrypto();
                return;
              }
              if (e instanceof CryptoConflict && e.state === 'locked') {
                setCryptoState('locked');
                return;
              }
              setCryptoState('error');
            })
            .finally(() => {
              if (cryptoSetupRef.current === setup) {
                cryptoSetupRef.current = null;
              }
            });
          cryptoSetupRef.current = setup;
        };

        // Listen for sync state using SDK's own event enum
        let cryptoSetupStarted = false;
        const onSync = async (state: string) => {
          if (
            cryptoStarted &&
            !cryptoSetupStarted &&
            (state === 'PREPARED' || state === 'SYNCING')
          ) {
            cryptoSetupStarted = true;
            runCryptoSetup();
          }
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
                // The session may have ended while the join was in flight.
                if (clientRef.current !== client) return;
                // If this is the first sync and we failed to join,
                // we cannot proceed — the user is not in the room.
                if (state === 'PREPARED') {
                  setConnectionState('error');
                  setError(translate('Could not join the conversation.'));
                  return;
                }
              }
            }

            if (clientRef.current !== client) return;
            setConnectionState('connected');
          } else if (state === 'ERROR') {
            setConnectionState('error');
            setError(translate('Connection lost, reconnecting...'));
          }
        };

        onSyncRef.current = onSync;
        client.on(sdk.ClientEvent.Sync, onSync);
        // The homeserver signed the session out: its device was removed (on
        // deactivation, from Element's session list, by Waldur's device cap) or
        // it rejected a token not yet due to expire. Whether the user may
        // still chat is Waldur's call, so ask it for a new session; connect()
        // ends the session if Waldur refuses.
        client.on(sdk.HttpApiEvent.SessionLoggedOut, () => {
          if (clientRef.current !== client) return;
          const now = Date.now();
          if (
            now - lastSignOutReconnectRef.current <
            SIGN_OUT_RECONNECT_WINDOW_MS
          ) {
            endSession();
            return;
          }
          lastSignOutReconnectRef.current = now;
          restartSession(roomUuid);
        });

        // matrix-js-sdk starts a MatrixRTC session for every room after the
        // first sync. Calls run on their own session (call/rtcSession.ts),
        // and these read call memberships unchecked: an `expires` that any
        // room member can set would spin their expiry timers.
        const rtcSessions = (client as any).matrixRTC;
        if (rtcSessions) rtcSessions.start = () => undefined;

        // Detached pending events: reactions/relations local echo calls
        // Room.getPendingEvents(), which throws unless ordering is detached.
        // Without this, reacting to a freshly-sent message fails with
        // "Cannot call getPendingEvents with pendingEventOrdering == chronological".
        client.startClient({
          initialSyncLimit: 30,
          pendingEventOrdering: sdk.PendingEventOrdering.Detached,
        });
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
    // connectionState is read via connectionStateRef, and endSession and
    // releaseClient never change, so this callback identity is stable across
    // state transitions. Consumers can safely treat `connect` as
    // referentially stable.
    [endSession, releaseClient],
  );

  // Replace an identity Waldur can't unlock, on the user's explicit request.
  const resetCryptoIdentity = useCallback(async () => {
    const client = clientRef.current;
    const keyHolder = keyHolderRef.current;
    if (!client || !keyHolder) return;
    setCryptoState('resetting');
    const reset = resetEncryption(client, keyHolder);
    cryptoSetupRef.current = reset;
    try {
      await reset;
      if (clientRef.current === client) setCryptoState('ready');
    } catch (e) {
      if (clientRef.current === client) setCryptoState('locked');
      throw e;
    } finally {
      if (cryptoSetupRef.current === reset) cryptoSetupRef.current = null;
    }
  }, []);

  // Escrow the recovery key the user brings from another client, such as
  // Element, when Waldur's own doesn't unlock the identity.
  const importCryptoRecoveryKey = useCallback(async (recoveryKey: string) => {
    const client = clientRef.current;
    const keyHolder = keyHolderRef.current;
    // The session ended while the dialog was open; say so rather than close
    // it as if the key had been taken.
    if (!client || !keyHolder) throw new CryptoSessionEnded();
    const unlocking = importRecoveryKey(client, keyHolder, recoveryKey);
    cryptoSetupRef.current = unlocking;
    try {
      await unlocking;
      if (clientRef.current === client) setCryptoState('ready');
    } finally {
      if (cryptoSetupRef.current === unlocking) cryptoSetupRef.current = null;
    }
  }, []);

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
      cryptoState,
      resetCryptoIdentity,
      importCryptoRecoveryKey,
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
      cryptoState,
      resetCryptoIdentity,
      importCryptoRecoveryKey,
    ],
  );

  return (
    <MatrixChatContext.Provider value={contextValue}>
      {children}
    </MatrixChatContext.Provider>
  );
};
