import {
  AssistantRuntimeProvider,
  ExternalStoreThreadData,
  ThreadMessageLike,
  useExternalStoreRuntime,
} from '@assistant-ui/react';
import { ReactNode, useCallback, useMemo, useRef, useState } from 'react';

import {
  createOnCancel,
  createOnEdit,
  createOnNew,
  createOnReload,
} from '@waldur/ai-assistant/lib/messages/messageHandlers';
import { convertMessage } from '@waldur/ai-assistant/lib/messages/messageUtils';
import '@waldur/ai-assistant/lib/registry/registerComponents';
import { createThreadListAdapter } from '@waldur/ai-assistant/lib/thread/threadListAdapter';
import {
  useAbortControllers,
  useThreadRunningState,
} from '@waldur/ai-assistant/lib/thread/threadStateHooks';
import { useThreadContext } from '@waldur/ai-assistant/logic/ThreadProvider';

const EMPTY_MESSAGES: ThreadMessageLike[] = [];

export function ThreadRuntimeProvider({
  children,
}: Readonly<{ children: ReactNode }>) {
  const { currentThreadId, setCurrentThreadId, threads, setThreads } =
    useThreadContext();

  const [threadList, setThreadList] = useState<
    ExternalStoreThreadData<'regular' | 'archived'>[]
  >([]);

  // Thread state management hooks
  const { getIsRunning, setIsRunning } = useThreadRunningState();
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
      }),
    [
      currentThreadId,
      threads,
      threadList,
      setThreadList,
      setCurrentThreadId,
      setThreads,
      abortThreadStream,
    ],
  );

  // Message handler dependencies
  // Handlers access messages via getter function that reads from messagesRef
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
    }),
    [
      setMessages,
      setIsRunning,
      currentThreadId,
      setThreadList,
      createController,
      cleanupController,
      abortThread,
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
