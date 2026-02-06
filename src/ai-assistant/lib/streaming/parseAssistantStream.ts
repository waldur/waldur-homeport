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
  contextInput: string;
  assistantId: string;
  signal: AbortSignal;
  onStreamComplete?: () => void;
  threadUuid?: string | null;
}

export async function parseAssistantStream(
  params: ParseAssistantStreamParams,
): Promise<string | undefined> {
  const {
    contextInput,
    assistantId,
    signal,
    setMessages,
    onStreamComplete,
    threadUuid,
  } = params;
  let currentBlocks: UIBlock[] = [];
  let hadError = false;
  let receivedThreadUuid: string | undefined;

  try {
    for await (const part of streamChat(contextInput, signal, threadUuid)) {
      if (signal?.aborted) {
        break;
      }

      // Capture thread_uuid from the backend metadata envelope
      if (part.m?.thread_uuid && !receivedThreadUuid) {
        receivedThreadUuid = part.m.thread_uuid as string;
      }

      // Skip metadata-only chunks (no renderable content)
      if (!part.k && !part.c) continue;

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

  return receivedThreadUuid;
}
