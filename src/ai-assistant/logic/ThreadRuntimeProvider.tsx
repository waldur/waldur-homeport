import {
  AssistantRuntimeProvider,
  ExternalStoreThreadData,
  ThreadMessageLike,
  useExternalStoreRuntime,
} from '@assistant-ui/react';
import {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  createOnCancel,
  createOnEdit,
  createOnNew,
  createOnReload,
} from '@/ai-assistant/lib/messages/messageHandlers';
import { convertMessage } from '@/ai-assistant/lib/messages/messageUtils';
import '@/ai-assistant/lib/registry/registerComponents';
import { createThreadListAdapter } from '@/ai-assistant/lib/thread/threadListAdapter';
import { useAbortControllers } from '@/ai-assistant/lib/thread/threadStateHooks';
import { useThreadList } from '@/ai-assistant/lib/thread/useThreadList';
import { useThreadContext } from '@/ai-assistant/logic/ThreadProvider';
import { isDrawerOpen } from '@/drawer/utils';

const EMPTY_MESSAGES: ThreadMessageLike[] = [];

export function ThreadRuntimeProvider({
  children,
}: Readonly<{ children: ReactNode }>) {
  const {
    currentThreadId,
    setCurrentThreadId,
    threads,
    setThreads,
    addNotification,
    clearNotification,
    setLoadingThreadId,
    getIsRunning,
    setIsRunning,
    getBackendThreadId,
    setBackendThreadId,
  } = useThreadContext();

  const [threadList, setThreadList] = useState<
    ExternalStoreThreadData<'regular' | 'archived'>[]
  >([]);

  // Fetch real thread list from backend
  const { data: backendThreads, refetch: refetchThreadList } = useThreadList();

  // Sync backend threads into threadList state
  useEffect(() => {
    if (!backendThreads) return;

    setThreadList((prev) => {
      // Keep locally-created threads (not yet synced) and merge with backend threads
      const localOnlyThreads = prev.filter(
        (t) => !backendThreads.some((bt) => bt.uuid === t.id),
      );

      const backendEntries: ExternalStoreThreadData<'regular' | 'archived'>[] =
        backendThreads.map((bt) => ({
          id: bt.uuid!,
          status: (bt.is_archived ? 'archived' : 'regular') as
            | 'regular'
            | 'archived',
          title: bt.name || undefined,
        }));

      return [...backendEntries, ...localOnlyThreads];
    });
  }, [backendThreads]);

  // Thread state management hooks (running state and backend thread IDs
  // live in ThreadProvider context so they survive drawer close/open).
  const { createController, abortThread, cleanupController } =
    useAbortControllers();

  // Get current thread state
  const isRunning = getIsRunning(currentThreadId);
  const messages = useMemo(
    () => threads.get(currentThreadId) ?? EMPTY_MESSAGES,
    [threads, currentThreadId],
  );

  // Use ref to prevent handlers from recreating on every message update
  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  // Ref for currentThreadId so onStreamComplete can read the latest value
  const currentThreadIdRef = useRef(currentThreadId);
  currentThreadIdRef.current = currentThreadId;

  // Messages setter for current thread
  const setMessages: React.Dispatch<
    React.SetStateAction<readonly ThreadMessageLike[]>
  > = useCallback(
    (valueOrUpdater) => {
      setThreads((prev) => {
        const currentMessages = prev.get(currentThreadId) ?? [];
        const newMessages =
          typeof valueOrUpdater === 'function'
            ? (
                valueOrUpdater as (
                  prev: readonly ThreadMessageLike[],
                ) => readonly ThreadMessageLike[]
              )(currentMessages)
            : valueOrUpdater;

        if (newMessages === currentMessages) return prev;

        const newThreads = new Map(prev);
        newThreads.set(currentThreadId, newMessages as ThreadMessageLike[]);

        return newThreads;
      });
    },
    [setThreads, currentThreadId],
  );

  // Abort stream helper
  const abortThreadStream = useCallback(
    (threadId: string) => {
      abortThread(threadId);
      setIsRunning(threadId, false);
    },
    [abortThread, setIsRunning],
  );

  // Stable refetch callback
  const refetchCallback = useCallback(() => {
    refetchThreadList();
  }, [refetchThreadList]);

  // Thread list adapter
  const threadListAdapter = useMemo(
    () =>
      createThreadListAdapter({
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
        refetchThreadList: refetchCallback,
        setLoadingThreadId,
      }),
    [
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
      refetchCallback,
      setLoadingThreadId,
    ],
  );

  // Message handler dependencies
  const handlerDeps = useMemo(
    () => ({
      get messages() {
        return messagesRef.current;
      },
      setMessages,
      setIsRunning,
      currentThreadId,
      setThreadList,
      createController,
      cleanupController,
      abortThread,
      onStreamComplete: () => {
        // Notify if drawer is closed or user switched to a different thread
        if (!isDrawerOpen() || currentThreadIdRef.current !== currentThreadId) {
          addNotification(currentThreadId);
        }
        // Refetch thread list to pick up auto-generated title and updated modified date
        refetchCallback();
      },
      getBackendThreadId,
      setBackendThreadId,
    }),
    [
      setMessages,
      setIsRunning,
      currentThreadId,
      setThreadList,
      createController,
      cleanupController,
      abortThread,
      addNotification,
      refetchCallback,
      getBackendThreadId,
      setBackendThreadId,
    ],
  );

  // Message handlers
  const onNew = useMemo(() => createOnNew(handlerDeps), [handlerDeps]);
  const onEdit = useMemo(() => createOnEdit(handlerDeps), [handlerDeps]);
  const onReload = useMemo(() => createOnReload(handlerDeps), [handlerDeps]);
  const onCancel = useMemo(() => createOnCancel(handlerDeps), [handlerDeps]);

  const runtime = useExternalStoreRuntime({
    isRunning,
    messages,
    convertMessage,
    onNew,
    onEdit,
    onReload,
    onCancel,
    adapters: {
      threadList: threadListAdapter,
    },
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      {children}
    </AssistantRuntimeProvider>
  );
}
