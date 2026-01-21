import { ThreadMessageLike } from '@assistant-ui/react';
import React, { createContext, ReactNode, useContext, useState } from 'react';

import { randomUUID } from '@waldur/core/utils';

interface ThreadContextType {
  currentThreadId: string;
  setCurrentThreadId: (id: string) => void;
  threads: Map<string, ThreadMessageLike[]>;
  setThreads: React.Dispatch<
    React.SetStateAction<Map<string, ThreadMessageLike[]>>
  >;
  hasNewMessages: boolean;
  setHasNewMessages: (hasNew: boolean) => void;
}

const ThreadContext = createContext<ThreadContextType | null>(null);

export function ThreadProvider({ children }: { children: ReactNode }) {
  // Create initial thread with unique ID
  const [threadID] = useState<string>(() => randomUUID());
  // Store ALL threads in a Map: threadId -> messages[]
  const [threads, setThreads] = useState<Map<string, ThreadMessageLike[]>>(
    () => new Map([[threadID, []]]),
  );
  // Track which thread is currently active
  const [currentThreadId, setCurrentThreadId] = useState(threadID);
  // Track if there are new messages
  const [hasNewMessages, setHasNewMessages] = useState(false);

  return (
    <ThreadContext.Provider
      value={{
        currentThreadId,
        setCurrentThreadId,
        threads,
        setThreads,
        hasNewMessages,
        setHasNewMessages,
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
