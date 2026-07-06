import {
  AppendMessage,
  AssistantRuntimeProvider,
  useExternalStoreRuntime,
} from '@assistant-ui/react';
import { ReactNode, useCallback } from 'react';

import {
  createAssistantPlaceholder,
  createUserMessage,
  getMessageText,
} from '@/ai-assistant/lib/messages/messageFactories';
import { convertMessage } from '@/ai-assistant/lib/messages/messageUtils';
import '@/ai-assistant/lib/registry/registerComponents';

import { useAnonymousThreadContext } from './AnonymousThreadProvider';
import { parseAnonymousChatStream } from './parseAnonymousChatStream';
import { getAnonymousSessionId } from './session';

export function AnonymousThreadRuntimeProvider({
  children,
}: Readonly<{ children: ReactNode }>) {
  // State lives in the app-level provider so it survives drawer close/open;
  // this runtime is recreated on every remount from that durable state.
  const { messages, setMessages, isRunning, setIsRunning, abortRef } =
    useAnonymousThreadContext();

  const onNew = useCallback(
    async (message: AppendMessage) => {
      const input = getMessageText(message);
      setIsRunning(true);
      setMessages((prev) => [...prev, createUserMessage(input)]);
      const placeholder = createAssistantPlaceholder();
      setMessages((prev) => [...prev, placeholder]);

      const controller = new AbortController();
      abortRef.current = controller;
      try {
        await parseAnonymousChatStream({
          input,
          sessionId: getAnonymousSessionId(),
          assistantId: placeholder.id!,
          signal: controller.signal,
          setMessages,
        });
      } finally {
        setIsRunning(false);
        abortRef.current = null;
      }
    },
    [setMessages, setIsRunning, abortRef],
  );

  const onCancel = useCallback(() => {
    abortRef.current?.abort();
    setIsRunning(false);
    return Promise.resolve();
  }, [abortRef, setIsRunning]);

  const runtime = useExternalStoreRuntime({
    isRunning,
    messages,
    convertMessage,
    onNew,
    onCancel,
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      {children}
    </AssistantRuntimeProvider>
  );
}
