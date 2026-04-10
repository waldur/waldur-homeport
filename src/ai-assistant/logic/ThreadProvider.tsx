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

import { randomUUID } from '@waldur/core/utils';
import { useUser } from '@waldur/workspace/hooks';

interface ThreadContextType {
  currentThreadId: string;
  setCurrentThreadId: (id: string) => void;
  threads: Map<string, ThreadMessageLike[]>;
  setThreads: React.Dispatch<
    React.SetStateAction<Map<string, ThreadMessageLike[]>>
  >;
  // Per-thread notifications
  threadNotifications: Set<string>;
  addNotification: (threadId: string) => void;
  clearNotification: (threadId: string) => void;
  // Backward-compatible global indicator
  hasNewMessages: boolean;
  setHasNewMessages: (hasNew: boolean) => void;
  // Thread loading state
  loadingThreadId: string | null;
  setLoadingThreadId: (id: string | null) => void;
  // Per-thread running state (lifted from threadStateHooks for sidebar access)
  getIsRunning: (threadId: string) => boolean;
  setIsRunning: (
    threadId: string,
    value: boolean | ((prev: boolean) => boolean),
  ) => void;
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
