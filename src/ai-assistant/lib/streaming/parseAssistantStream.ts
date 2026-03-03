import {
  markBlocksComplete,
  updateBlocks,
} from '@waldur/ai-assistant/lib/blocks/blockManager';
import { streamChat } from '@waldur/ai-assistant/lib/streaming/streamChat';
import {
  BlockBasedMetadata,
  MessageHandlerDependencies,
  UIBlock,
} from '@waldur/ai-assistant/lib/types';
import { translate } from '@waldur/i18n';

interface ParseAssistantStreamParams extends Pick<
  MessageHandlerDependencies,
  'setMessages'
> {
  input: string;
  assistantId: string;
  signal: AbortSignal;
  onStreamComplete?: () => void;
  threadUuid?: string;
  mode?: 'reload' | 'edit';
  edit_message_uuid?: string;
}

interface ParseAssistantStreamResult {
  threadUuid?: string;
  userMessageUuid?: string;
  assistantMessageUuid?: string;
  warning?: string;
}

export async function parseAssistantStream(
  params: ParseAssistantStreamParams,
): Promise<ParseAssistantStreamResult | undefined> {
  const {
    input,
    assistantId,
    signal,
    setMessages,
    onStreamComplete,
    threadUuid,
    mode,
    edit_message_uuid,
  } = params;
  let currentBlocks: UIBlock[] = [];
  let hadError = false;
  let receivedThreadUuid: string | undefined;
  let userMessageUuid: string | undefined;
  let assistantMessageUuid: string | undefined;
  let warning: string | undefined;

  try {
    for await (const part of streamChat(
      input,
      signal,
      threadUuid,
      mode,
      edit_message_uuid,
    )) {
      if (signal?.aborted) {
        break;
      }

      // Capture metadata from the backend envelope
      if (part.m) {
        if (part.m.thread_uuid && !receivedThreadUuid) {
          receivedThreadUuid = part.m.thread_uuid as string;
        }
        if (part.m.user_message_uuid) {
          userMessageUuid = part.m.user_message_uuid as string;
        }
        if (part.m.assistant_message_uuid) {
          assistantMessageUuid = part.m.assistant_message_uuid as string;
        }
      }

      // Capture PII/security warning
      if (part.w) {
        warning = part.w;
      }

      // Skip metadata-only chunks (no renderable content).
      // Warning-only chunks (part.w without part.k/part.c) pass through
      // so that setMessages is called, persisting the warning in metadata.
      if (!part.k && !part.c && !part.w) continue;

      // Accumulate updates in memory
      currentBlocks = updateBlocks(currentBlocks, part);

      setMessages((prev) =>
        prev.map((m) => {
          if (m.id !== assistantId) return m;

          const existingMetadata = m.metadata?.custom as
            | BlockBasedMetadata
            | undefined;

          return {
            ...m,
            content: [{ type: 'text', text: '' }],
            metadata: {
              ...m.metadata,
              custom: {
                ...existingMetadata,
                blocks: currentBlocks,
                ...(warning ? { warning } : {}),
              },
            },
            status: { type: 'running' },
          };
        }),
      );
    }
  } catch (error: unknown) {
    hadError = true;
    const aborted = signal?.aborted;
    const errorMessage = aborted
      ? translate('Assistant message was cancelled')
      : error instanceof Error
        ? error.message
        : translate('An unknown error occurred');

    const reason: 'cancelled' | 'error' = aborted ? 'cancelled' : 'error';

    setMessages((prev) =>
      prev.map((m) =>
        m.id === assistantId
          ? {
              ...m,
              status: {
                type: 'incomplete',
                reason,
                error: errorMessage,
              },
            }
          : m,
      ),
    );
  } finally {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== assistantId) return m;

        // Don't overwrite incomplete status
        if (m.status?.type === 'incomplete') return m;

        // Mark all blocks as complete
        const existingMetadata = m.metadata?.custom as
          | BlockBasedMetadata
          | undefined;
        const existingBlocks: UIBlock[] = existingMetadata?.blocks || [];
        const completedBlocks = markBlocksComplete(existingBlocks);

        return {
          ...m,
          metadata: {
            ...m.metadata,
            custom: {
              ...existingMetadata,
              blocks: completedBlocks,
              ...(warning ? { warning } : {}),
            },
          },
          status: { type: 'complete', reason: 'stop' },
        };
      }),
    );

    // Notify that stream completed successfully (not aborted and no errors)
    if (!signal?.aborted && !hadError && onStreamComplete) {
      onStreamComplete();
    }
  }

  return {
    threadUuid: receivedThreadUuid,
    userMessageUuid,
    assistantMessageUuid,
    warning,
  };
}
