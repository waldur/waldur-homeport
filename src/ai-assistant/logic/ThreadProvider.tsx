import { ThreadMessageLike } from '@assistant-ui/react';
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import { randomUUID } from '@/core/utils';
import { useUser } from '@/workspace/hooks';

interface ThreadContextType {
  currentThreadId: string;
  setCurrentThreadId: (id: string) => void;
  threads: Map<string, ThreadMessageLike[]>;
  setThreads: React.Dispatch<
    React.SetStateAction<Map<string, ThreadMessageLike[]>>
  >;
  threadNotifications: Set<string>;
  addNotification: (threadId: string) => void;
  clearNotification: (threadId: string) => void;
  // Backward-compatible global indicator
  hasNewMessages: boolean;
  setHasNewMessages: (hasNew: boolean) => void;
  loadingThreadId: string | null;
  setLoadingThreadId: (id: string | null) => void;
  // Per-thread running state (lifted from threadStateHooks for sidebar access)
  getIsRunning: (threadId: string) => boolean;
  setIsRunning: (
    threadId: string,
    value: boolean | ((prev: boolean) => boolean),
  ) => void;
  // Local threadId -> backend thread UUID mapping. Lives here (app level)
  // so it survives drawer close/open — otherwise a closed-then-reopened
  // drawer would lose the mapping and the next message would spawn a new
  // backend thread.
  getBackendThreadId: (threadId: string) => string | undefined;
  setBackendThreadId: (threadId: string, uuid: string) => void;
  // Patch a message's metadata.custom across all threads by its backend UUID.
  // Used for out-of-band server updates (e.g. feedback submissions) where the
  // caller has the backend UUID but not the local thread id.
  patchMessageByBackendUuid: (
    backendUuid: string,
    patch: Record<string, unknown>,
  ) => void;
  // Per-thread composer draft text. Lives here (app level) so the in-progress
  // message survives drawer close/open — the assistant-ui runtime (and its
  // composer state) is recreated every time the drawer remounts.
  getComposerDraft: (threadId: string) => string;
  setComposerDraft: (threadId: string, text: string) => void;
}

const ThreadContext = createContext<ThreadContextType | null>(null);

export function ThreadProvider({ children }: { children: ReactNode }) {
  const user = useUser();
  const prevUserUuid = useRef(user?.uuid);

  const [threadID, setThreadID] = useState<string>(() => randomUUID());
  const [threads, setThreads] = useState<Map<string, ThreadMessageLike[]>>(
    () => new Map([[threadID, []]]),
  );
  const [currentThreadId, setCurrentThreadId] = useState(threadID);
  const [threadNotifications, setThreadNotifications] = useState<Set<string>>(
    () => new Set(),
  );
  const [loadingThreadId, setLoadingThreadId] = useState<string | null>(null);
  const [runningThreads, setRunningThreads] = useState<Map<string, boolean>>(
    new Map(),
  );
  // Ref-backed mapping: never read for rendering, only looked up inside
  // message handlers. Keeping this at the provider level (rather than inside
  // ThreadRuntimeProvider) means closing/reopening the drawer no longer
  // discards the local-id -> backend-uuid mapping.
  const backendThreadIdsRef = useRef<Map<string, string>>(new Map());
  // Ref-backed: composer text updates on every keystroke, so state would
  // thrash every consumer of ThreadContext. Only read on drawer remount /
  // thread switch, so a ref is enough.
  const composerDraftsRef = useRef<Map<string, string>>(new Map());

  // Reset all state when user changes (impersonation, logout/login)
  useEffect(() => {
    if (user?.uuid === prevUserUuid.current) return;
    prevUserUuid.current = user?.uuid;
    const newId = randomUUID();
    setThreadID(newId);
    setThreads(new Map([[newId, []]]));
    setCurrentThreadId(newId);
    setThreadNotifications(new Set());
    setLoadingThreadId(null);
    setRunningThreads(new Map());
    backendThreadIdsRef.current = new Map();
    composerDraftsRef.current = new Map();
  }, [user?.uuid]);

  const addNotification = useCallback((threadId: string) => {
    setThreadNotifications((prev) => {
      const next = new Set(prev);
      next.add(threadId);
      return next;
    });
  }, []);

  const clearNotification = useCallback((threadId: string) => {
    setThreadNotifications((prev) => {
      if (!prev.has(threadId)) return prev;
      const next = new Set(prev);
      next.delete(threadId);
      return next;
    });
  }, []);

  const hasNewMessages = threadNotifications.size > 0;

  const setHasNewMessages = useCallback((hasNew: boolean) => {
    if (!hasNew) {
      setThreadNotifications(new Set());
    }
  }, []);

  const getIsRunning = useCallback(
    (threadId: string) => runningThreads.get(threadId) ?? false,
    [runningThreads],
  );

  const setIsRunning = useCallback(
    (threadId: string, value: boolean | ((prev: boolean) => boolean)) => {
      setRunningThreads((prev) => {
        const next = new Map(prev);
        const currentRunning = prev.get(threadId) ?? false;
        const newValue =
          typeof value === 'function' ? value(currentRunning) : value;
        next.set(threadId, newValue);
        return next;
      });
    },
    [],
  );

  const getBackendThreadId = useCallback(
    (threadId: string) => backendThreadIdsRef.current.get(threadId),
    [],
  );

  const setBackendThreadId = useCallback((threadId: string, uuid: string) => {
    if (backendThreadIdsRef.current.get(threadId) === uuid) return;
    backendThreadIdsRef.current.set(threadId, uuid);
  }, []);

  const getComposerDraft = useCallback(
    (threadId: string) => composerDraftsRef.current.get(threadId) ?? '',
    [],
  );

  const setComposerDraft = useCallback((threadId: string, text: string) => {
    if (text) {
      composerDraftsRef.current.set(threadId, text);
    } else {
      composerDraftsRef.current.delete(threadId);
    }
  }, []);

  const patchMessageByBackendUuid = useCallback(
    (backendUuid: string, patch: Record<string, unknown>) => {
      const definedPatch: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(patch)) {
        if (value !== undefined) definedPatch[key] = value;
      }
      if (Object.keys(definedPatch).length === 0) return;

      setThreads((prev) => {
        const next = new Map(prev);
        let anyChanged = false;
        for (const [threadId, messages] of prev) {
          let changed = false;
          const updated = messages.map((m) => {
            const custom = m.metadata?.custom as
              { backendUuid?: string } | undefined;
            if (custom?.backendUuid !== backendUuid) return m;
            changed = true;
            return {
              ...m,
              metadata: {
                ...m.metadata,
                custom: { ...m.metadata?.custom, ...definedPatch },
              },
            };
          });
          if (changed) {
            next.set(threadId, updated);
            anyChanged = true;
          }
        }
        return anyChanged ? next : prev;
      });
    },
    [],
  );

  return (
    <ThreadContext.Provider
      value={{
        currentThreadId,
        setCurrentThreadId,
        threads,
        setThreads,
        threadNotifications,
        addNotification,
        clearNotification,
        hasNewMessages,
        setHasNewMessages,
        loadingThreadId,
        setLoadingThreadId,
        getIsRunning,
        setIsRunning,
        getBackendThreadId,
        setBackendThreadId,
        patchMessageByBackendUuid,
        getComposerDraft,
        setComposerDraft,
      }}
    >
      {children}
    </ThreadContext.Provider>
  );
}

export function useThreadContext(): ThreadContextType {
  const context = useContext(ThreadContext);
  if (context === null) {
    throw new Error('useThreadContext must be used within ThreadProvider');
  }
  return context;
}
