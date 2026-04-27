import {
  ExternalStoreThreadData,
  ExternalStoreThreadListAdapter,
  ThreadMessageLike,
} from '@assistant-ui/react';
import { chatThreadsArchive } from 'waldur-js-client';

import { randomUUID } from '@/core/utils';
import { translate } from '@/i18n';

import { fetchAndConvertMessages } from '../messages/messageLoader';

interface CreateThreadListAdapterParams {
  currentThreadId: string;
  threads: Map<string, ThreadMessageLike[]>;
  threadList: ExternalStoreThreadData<'regular' | 'archived'>[];
  setThreadList: React.Dispatch<
    React.SetStateAction<ExternalStoreThreadData<'regular' | 'archived'>[]>
  >;
  setCurrentThreadId: (id: string) => void;
  setThreads: React.Dispatch<
    React.SetStateAction<Map<string, ThreadMessageLike[]>>
  >;
  abortThreadStream: (threadId: string) => void;
  clearNotification: (threadId: string) => void;
  getBackendThreadId: (threadId: string) => string | undefined;
  setBackendThreadId: (threadId: string, uuid: string) => void;
  refetchThreadList: () => void;
  setLoadingThreadId: (id: string | null) => void;
}

/**
 * Delete empty threads that were created locally but never used.
 * Backend-sourced threads are kept even if empty (they exist on the server).
 */
const deleteEmptyLocalThread = (
  threads: Map<string, ThreadMessageLike[]>,
  setThreads: React.Dispatch<
    React.SetStateAction<Map<string, ThreadMessageLike[]>>
  >,
  backendThreadIds: Set<string>,
) => {
  threads.forEach((thread, threadId) => {
    if (thread.length === 0 && !backendThreadIds.has(threadId)) {
      setThreads((prev) => {
        const next = new Map(prev);
        next.delete(threadId);
        return next;
      });
    }
  });
};

export const addThreadToListIfNotExists = (
  setThreadList: React.Dispatch<
    React.SetStateAction<ExternalStoreThreadData<'regular' | 'archived'>[]>
  >,
  currentThreadId: string,
) => {
  setThreadList((prev) => {
    const exists = prev.some((t) => t.id === currentThreadId);
    if (exists) return prev;

    return [
      ...prev,
      {
        id: currentThreadId,
        status: 'regular' as const,
        title: translate('New Chat'),
      },
    ];
  });
};

export const createThreadListAdapter = ({
  currentThreadId,
  threads,
  threadList,
  setThreadList,
  setCurrentThreadId,
  setThreads,
  abortThreadStream,
  clearNotification,
  getBackendThreadId,
  setBackendThreadId,
  refetchThreadList,
  setLoadingThreadId,
}: CreateThreadListAdapterParams): ExternalStoreThreadListAdapter => {
  // Collect known backend thread IDs so we don't delete them when empty
  const backendThreadIds = new Set<string>();
  for (const t of threadList) {
    backendThreadIds.add(t.id);
  }

  return {
    threadId: currentThreadId,
    threads: threadList.filter(
      (t): t is ExternalStoreThreadData<'regular'> => t.status === 'regular',
    ),
    archivedThreads: threadList.filter(
      (t): t is ExternalStoreThreadData<'archived'> => t.status === 'archived',
    ),

    onSwitchToNewThread: () => {
      const newId = randomUUID();
      deleteEmptyLocalThread(threads, setThreads, backendThreadIds);

      setThreads((prev) => {
        const next = new Map(prev);
        next.set(newId, []);
        return next;
      });
      setCurrentThreadId(newId);
    },

    onSwitchToThread: async (threadId) => {
      deleteEmptyLocalThread(threads, setThreads, backendThreadIds);
      clearNotification(threadId);

      // For backend-sourced threads, the threadId IS the backend UUID.
      // Register this mapping so message handlers can find it.
      if (backendThreadIds.has(threadId)) {
        setBackendThreadId(threadId, threadId);
      }

      // If thread messages are not in memory, fetch from backend
      if (!threads.has(threadId)) {
        setLoadingThreadId(threadId);
        setCurrentThreadId(threadId);

        try {
          const backendUuid = getBackendThreadId(threadId) ?? threadId;
          const messages = await fetchAndConvertMessages(backendUuid);
          setThreads((prev) => {
            const next = new Map(prev);
            next.set(threadId, messages);
            return next;
          });
        } finally {
          setLoadingThreadId(null);
        }
      } else {
        setCurrentThreadId(threadId);
      }
    },

    onArchive: async (threadId) => {
      abortThreadStream(threadId);

      // Optimistic update
      setThreadList((prev) =>
        prev.map((t) =>
          t.id === threadId ? { ...t, status: 'archived' as const } : t,
        ),
      );

      try {
        // Sync to backend
        const backendUuid = getBackendThreadId(threadId) ?? threadId;
        await chatThreadsArchive({ path: { uuid: backendUuid } });
      } catch {
        // Rollback via compensating operation — safer than snapshotting
        // `prev`, since concurrent updates to threadList are preserved.
        setThreadList((prev) =>
          prev.map((t) =>
            t.id === threadId ? { ...t, status: 'regular' as const } : t,
          ),
        );
        return;
      }

      refetchThreadList();

      if (currentThreadId === threadId) {
        const regularThreads = threadList.filter(
          (t) => t.status === 'regular' && t.id !== threadId,
        );

        if (regularThreads.length > 0) {
          setCurrentThreadId(regularThreads[0].id);
        } else {
          const newId = randomUUID();

          setThreads((prev) => {
            const next = new Map(prev);
            next.set(newId, []);
            return next;
          });

          setCurrentThreadId(newId);
        }
      }
    },
  };
};
