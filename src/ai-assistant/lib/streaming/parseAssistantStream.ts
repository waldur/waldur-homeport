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

interface ParseAssistantStreamParams extends Pick<
  MessageHandlerDependencies,
  'setMessages'
> {
  contextInput: string;
  assistantId: string;
  signal: AbortSignal;
}

export async function parseAssistantStream(params: ParseAssistantStreamParams) {
  const { contextInput, assistantId, signal, setMessages } = params;
  let currentBlocks: UIBlock[] = [];

  try {
    for await (const part of streamChat(contextInput, signal)) {
      if (signal?.aborted) {
        break;
      }

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
    const aborted = signal?.aborted;
    const errorMessage = aborted
      ? 'Assistant message was cancelled'
      : error instanceof Error
        ? error.message
        : 'An unknown error occurred';

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
  }
}
