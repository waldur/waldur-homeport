import { ThreadMessageLike } from '@assistant-ui/react';
import React, { createContext, ReactNode, useContext, useState } from 'react';

import { randomUUID } from '@waldur/core/utils';

const ThreadContext = createContext<{
  currentThreadId: string;
  setCurrentThreadId: (id: string) => void;
  threads: Map<string, ThreadMessageLike[]>;
  setThreads: React.Dispatch<
    React.SetStateAction<Map<string, ThreadMessageLike[]>>
  >;
}>({
  currentThreadId: 'default',
  setCurrentThreadId: () => {},
  threads: new Map(),
  setThreads: () => {},
});

export function ThreadProvider({ children }: { children: ReactNode }) {
  // Create initial thread with unique ID
  const [threadID] = useState<string>(() => randomUUID());
  // Store ALL threads in a Map: threadId -> messages[]
  const [threads, setThreads] = useState<Map<string, ThreadMessageLike[]>>(
    () => new Map([[threadID, []]]),
  );
  // Track which thread is currently active
  const [currentThreadId, setCurrentThreadId] = useState(threadID);

  return (
    <ThreadContext.Provider
      value={{ currentThreadId, setCurrentThreadId, threads, setThreads }}
    >
      {children}
    </ThreadContext.Provider>
  );
}

export function useThreadContext() {
  const context = useContext(ThreadContext);
  if (!context) {
    throw new Error('useThreadContext must be used within ThreadProvider');
  }
  return context;
}
