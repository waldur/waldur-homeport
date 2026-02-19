import { AppendMessage } from '@assistant-ui/react';
import { chatMessagesEdit } from 'waldur-js-client';

import {
  addPreviousBlocks,
  extractTextFromMessageContent,
  setBackendUuid,
} from '@waldur/ai-assistant/lib/messages/messageUtils';
import { generateAndSetThreadTitle } from '@waldur/ai-assistant/lib/streaming/generateAndSetThreadTitle';
import { parseAssistantStream } from '@waldur/ai-assistant/lib/streaming/parseAssistantStream';
import { addThreadToListIfNotExists } from '@waldur/ai-assistant/lib/thread/threadListAdapter';
import {
  MessageHandlerDependencies,
  RunConfig,
  UIBlock,
} from '@waldur/ai-assistant/lib/types';

import {
  createUserMessage,
  createAssistantPlaceholder,
} from './messageFactories';

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

      const abortController = deps.createController(deps.currentThreadId);

      const result = await parseAssistantStream({
        input,
        assistantId: assistantPlaceholder.id!,
        signal: abortController.signal,
        setMessages: deps.setMessages,
        onStreamComplete: deps.onStreamComplete,
        threadUuid: deps.getBackendThreadId(deps.currentThreadId),
      });
      if (result?.threadUuid) {
        deps.setBackendThreadId(deps.currentThreadId, result.threadUuid);
      }
      if (result?.userMessageUuid) {
        setBackendUuid(
          deps.setMessages,
          userMessage.id,
          result.userMessageUuid,
        );
      }
      if (result?.assistantMessageUuid) {
        setBackendUuid(
          deps.setMessages,
          assistantPlaceholder.id!,
          result.assistantMessageUuid,
        );
      }
      if (isFirstMessage && !abortController.signal.aborted) {
        await generateAndSetThreadTitle(
          input,
          deps,
          abortController.signal,
          result?.threadUuid,
        );
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
      const oldAssistant = deps.messages[userIndex + 1];
      if (!oldAssistant) return;

      const assistantIdToStream = oldAssistant.id ?? '';
      if (!assistantIdToStream) return;

      // Get backend UUID from user message metadata
      const backendUserUuid = (
        oldUser.metadata?.custom as { backendUuid?: string }
      )?.backendUuid;

      // Extract current blocks before clearing
      const currentBlocks =
        (oldAssistant.metadata?.custom as { blocks?: UIBlock[] })?.blocks ?? [];

      deps.setMessages((prev) => {
        const updated = [...prev];
        // Update user message (no history tracking needed)
        updated[userIndex] = {
          ...oldUser,
          content: [{ type: 'text', text: input }],
        };

        const updatedMetadata = addPreviousBlocks(
          oldAssistant.metadata,
          currentBlocks,
        );

        updated[userIndex + 1] = {
          ...oldAssistant,
          content: [{ type: 'text', text: '' }],
          status: { type: 'running' },
          metadata: {
            ...updatedMetadata,
            custom: {
              ...updatedMetadata?.custom,
              blocks: [], // Clear blocks for new stream
            },
          },
        };
        return updated;
      });

      // Call backend edit endpoint if we have a backend UUID
      if (backendUserUuid) {
        try {
          await chatMessagesEdit({
            body: { content: input },
            path: { uuid: backendUserUuid },
          });
        } catch {
          // Continue with stream even if edit fails
        }
      }

      const abortController = deps.createController(deps.currentThreadId);

      // Stream with mode="reload" to regenerate assistant response
      const result = await parseAssistantStream({
        input,
        assistantId: assistantIdToStream,
        signal: abortController.signal,
        setMessages: deps.setMessages,
        onStreamComplete: deps.onStreamComplete,
        threadUuid: deps.getBackendThreadId(deps.currentThreadId),
        mode: 'reload',
      });
      if (result?.threadUuid) {
        deps.setBackendThreadId(deps.currentThreadId, result.threadUuid);
      }
      if (result?.userMessageUuid) {
        setBackendUuid(deps.setMessages, oldUser.id!, result.userMessageUuid);
      }
      if (result?.assistantMessageUuid) {
        setBackendUuid(
          deps.setMessages,
          assistantIdToStream,
          result.assistantMessageUuid,
        );
      }
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

      const userIndex = assistantIndex - 1;
      if (userIndex < 0) return;
      const oldUser = deps.messages[userIndex];
      const input = extractTextFromMessageContent(oldUser.content);

      if (oldAssistant.role !== 'assistant' || oldUser.role !== 'user') return;

      // Extract current blocks before clearing
      const currentBlocks =
        (oldAssistant.metadata?.custom as { blocks?: UIBlock[] })?.blocks ?? [];

      deps.setMessages((prev) => {
        const updated = [...prev];

        const updatedMetadata = addPreviousBlocks(
          oldAssistant.metadata,
          currentBlocks,
        );

        updated[userIndex + 1] = {
          ...oldAssistant,
          content: [{ type: 'text', text: '' }],
          status: { type: 'running' },
          metadata: {
            ...updatedMetadata,
            custom: {
              ...updatedMetadata?.custom,
              blocks: [], // Clear blocks for new stream
            },
          },
        };
        return updated;
      });

      const abortController = deps.createController(deps.currentThreadId);

      // Stream with mode="reload" to regenerate assistant response
      const result = await parseAssistantStream({
        input,
        assistantId: sourceId,
        signal: abortController.signal,
        setMessages: deps.setMessages,
        onStreamComplete: deps.onStreamComplete,
        threadUuid: deps.getBackendThreadId(deps.currentThreadId),
        mode: 'reload',
      });
      if (result?.threadUuid) {
        deps.setBackendThreadId(deps.currentThreadId, result.threadUuid);
      }
      if (result?.assistantMessageUuid) {
        setBackendUuid(deps.setMessages, sourceId, result.assistantMessageUuid);
      }
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
