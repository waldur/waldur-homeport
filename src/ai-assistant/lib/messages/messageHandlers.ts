import { AppendMessage } from '@assistant-ui/react';

import { extractTextFromMessageContent } from '@waldur/ai-assistant/lib/messages/messageUtils';
import { generateAndSetThreadTitle } from '@waldur/ai-assistant/lib/streaming/generateAndSetThreadTitle';
import { parseAssistantStream } from '@waldur/ai-assistant/lib/streaming/parseAssistantStream';
import { addThreadToListIfNotExists } from '@waldur/ai-assistant/lib/thread/threadListAdapter';
import {
  MessageHandlerDependencies,
  RunConfig,
} from '@waldur/ai-assistant/lib/types';

import {
  createUserMessage,
  createAssistantPlaceholder,
} from './messageFactories';
import { addContext, addPreviousText } from './messageUtils';

type StartRunConfig = {
  parentId: string | null;
  sourceId: string | null;
  runConfig: RunConfig;
};

export const createOnNew = (deps: MessageHandlerDependencies) => {
  return async (message: AppendMessage) => {
    deps.setIsRunning(deps.currentThreadId, true);

    try {
      const firstContent = message.content[0];
      if (
        typeof firstContent !== 'object' ||
        !firstContent ||
        firstContent.type !== 'text'
      )
        throw new Error('Only text messages are supported');

      const input = firstContent.text;
      const isFirstMessage = deps.messages.length === 0;

      const userMessage = createUserMessage(input);
      deps.setMessages((prev) => [...prev, userMessage]);

      // Add thread to thread list if it doesn't exist there yet
      addThreadToListIfNotExists(deps.setThreadList, deps.currentThreadId);

      const assistantPlaceholder = createAssistantPlaceholder();
      deps.setMessages((prev) => [...prev, assistantPlaceholder]);

      const contextInput = addContext(input, deps.messages.slice(0, -1));
      const abortController = deps.createController(deps.currentThreadId);

      await parseAssistantStream({
        contextInput,
        assistantId: assistantPlaceholder.id!,
        signal: abortController.signal,
        setMessages: deps.setMessages,
      });
      if (isFirstMessage) {
        await generateAndSetThreadTitle(input, deps);
      }
    } finally {
      deps.setIsRunning(deps.currentThreadId, false);
      deps.cleanupController(deps.currentThreadId);
    }
  };
};

export const createOnEdit = (deps: MessageHandlerDependencies) => {
  return async (message: AppendMessage) => {
    deps.setIsRunning(deps.currentThreadId, true);
    try {
      const firstContent = message.content[0];
      if (
        typeof firstContent !== 'object' ||
        !firstContent ||
        firstContent.type !== 'text'
      )
        throw new Error('Only text messages are supported');

      const input = firstContent.text;
      const sourceId = message.sourceId;

      const userIndex = deps.messages.findIndex((m) => m.id === sourceId);
      if (userIndex === -1) return;

      const oldUser = deps.messages[userIndex];
      const oldText = extractTextFromMessageContent(oldUser.content);

      const oldAssistant = deps.messages[userIndex + 1];
      const oldAssistantText = extractTextFromMessageContent(
        oldAssistant.content,
      );

      const assistantIdToStream = oldAssistant?.id ?? '';
      if (!assistantIdToStream) return;

      deps.setMessages((prev) => {
        const updated = [...prev];
        updated[userIndex] = {
          ...oldUser,
          content: [{ type: 'text', text: input }],
          metadata: addPreviousText(oldUser.metadata, oldText),
        };
        updated[userIndex + 1] = {
          ...oldAssistant,
          content: [{ type: 'text', text: '' }],
          status: { type: 'running' },
          metadata: addPreviousText(oldAssistant.metadata, oldAssistantText),
        };
        return updated;
      });

      const contextInput = addContext(input, deps.messages.slice(0, userIndex));
      const abortController = deps.createController(deps.currentThreadId);

      await parseAssistantStream({
        contextInput,
        assistantId: assistantIdToStream,
        signal: abortController.signal,
        setMessages: deps.setMessages,
      });
    } finally {
      deps.setIsRunning(deps.currentThreadId, false);
      deps.cleanupController(deps.currentThreadId);
    }
  };
};

export const createOnReload = (deps: MessageHandlerDependencies) => {
  return async (_parentId: string | null, config: StartRunConfig) => {
    deps.setIsRunning(deps.currentThreadId, true);
    try {
      const sourceId = config.sourceId;
      if (!sourceId) return;

      const assistantIndex = deps.messages.findIndex((m) => m.id === sourceId);
      if (assistantIndex === -1) return;

      const oldAssistant = deps.messages[assistantIndex];
      const oldAssistantText = extractTextFromMessageContent(
        oldAssistant.content,
      );

      const userIndex = assistantIndex - 1;
      if (userIndex < 0) return;
      const oldUser = deps.messages[userIndex];
      const input = extractTextFromMessageContent(oldUser.content);

      if (oldAssistant.role !== 'assistant' || oldUser.role !== 'user') return;

      deps.setMessages((prev) => {
        const updated = [...prev];
        updated[userIndex + 1] = {
          ...oldAssistant,
          content: [{ type: 'text', text: '' }],
          status: { type: 'running' },
          metadata: addPreviousText(oldAssistant.metadata, oldAssistantText),
        };
        return updated;
      });

      const contextInput = addContext(input, deps.messages.slice(0, userIndex));
      const abortController = deps.createController(deps.currentThreadId);

      await parseAssistantStream({
        contextInput,
        assistantId: sourceId,
        signal: abortController.signal,
        setMessages: deps.setMessages,
      });
    } finally {
      deps.setIsRunning(deps.currentThreadId, false);
      deps.cleanupController(deps.currentThreadId);
    }
  };
};

export const createOnCancel = (deps: MessageHandlerDependencies) => {
  return async () => {
    const threadId = deps.currentThreadId;

    deps.abortThread(threadId);
    deps.setIsRunning(threadId, false);

    // small no-op await to satisfy eslint require-await
    await Promise.resolve();
  };
};
