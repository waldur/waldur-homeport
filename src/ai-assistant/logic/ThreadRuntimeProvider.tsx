import {
  AssistantRuntimeProvider,
  ExternalStoreThreadData,
  ThreadMessageLike,
  useExternalStoreRuntime,
} from '@assistant-ui/react';
import { ReactNode, useState } from 'react';

import {
  createOnCancel,
  createOnEdit,
  createOnNew,
  createOnReload,
} from '@waldur/ai-assistant/lib/messages/messageHandlers';
import { convertMessage } from '@waldur/ai-assistant/lib/messages/messageUtils';
import { createThreadListAdapter } from '@waldur/ai-assistant/lib/thread/threadListAdapter';
import {
  useAbortControllers,
  useThreadRunningState,
} from '@waldur/ai-assistant/lib/thread/threadStateHooks';
import { useThreadContext } from '@waldur/ai-assistant/logic/ThreadProvider';

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
  const messages = threads.get(currentThreadId) ?? [];

  // Messages setter for current thread
  const setMessages: React.Dispatch<
    React.SetStateAction<readonly ThreadMessageLike[]>
  > = (valueOrUpdater) => {
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
  };

  // Abort stream helper
  const abortThreadStream = (threadId: string) => {
    abortThread(threadId);
    setIsRunning(threadId, false);
  };

  // Thread list adapter
  const threadListAdapter = createThreadListAdapter({
    currentThreadId,
    threads,
    threadList,
    setThreadList,
    setCurrentThreadId,
    setThreads,
    abortThreadStream,
  });

  // Message handler dependencies
  const handlerDeps = {
    messages,
    setMessages,
    setIsRunning,
    currentThreadId,
    setThreadList,
    createController,
    cleanupController,
    abortThread,
  };

  // Message handlers
  const onNew = createOnNew(handlerDeps);
  const onEdit = createOnEdit(handlerDeps);
  const onReload = createOnReload(handlerDeps);
  const onCancel = createOnCancel(handlerDeps);

  // Runtime
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
