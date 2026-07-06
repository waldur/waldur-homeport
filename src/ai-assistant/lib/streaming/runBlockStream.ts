import { ChatResponse } from 'waldur-js-client';

import {
  markBlocksComplete,
  updateBlocks,
} from '@/ai-assistant/lib/blocks/blockManager';
import {
  BlockBasedMetadata,
  MessageHandlerDependencies,
  UIBlock,
} from '@/ai-assistant/lib/types';
import { translate } from '@/i18n';

interface RunBlockStreamParams {
  stream: AsyncIterable<ChatResponse>;
  assistantId: string;
  signal: AbortSignal;
  setMessages: MessageHandlerDependencies['setMessages'];
  // Pull backend-specific metadata off each frame (thread/message uuids, or
  // interaction/token) into caller-owned state.
  captureMeta?: (part: ChatResponse) => void;
  // Extra custom-metadata merged into the assistant message on every write —
  // including a metadata-only frame, so feedback/click attribution works before
  // any block arrives (e.g. interaction uuid + feedback token). Undefined = none.
  extraCustom?: () => Partial<BlockBasedMetadata> | undefined;
  // Map a caught (non-abort) error to a user-facing message.
  mapError: (error: unknown) => string;
  // Side effect on a caught (non-abort) error (e.g. reset the anon session).
  onError?: (error: unknown) => void;
  // Called once the stream completes cleanly (not aborted, no error).
  onComplete?: () => void;
}

// Shared driver for a block-based assistant stream: accumulates UIBlocks, writes
// them to the target message with a 'running' status, maps a failure to an
// 'incomplete' status, and marks the blocks complete in a finally. The
// authenticated and anonymous threads differ only at the injected seams.
export async function runBlockStream({
  stream,
  assistantId,
  signal,
  setMessages,
  captureMeta,
  extraCustom,
  mapError,
  onError,
  onComplete,
}: RunBlockStreamParams): Promise<void> {
  let currentBlocks: UIBlock[] = [];
  let hadError = false;
  let warning: string | undefined;

  const writeCustom = (custom: Partial<BlockBasedMetadata>) =>
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== assistantId) return m;
        const existing = m.metadata?.custom as BlockBasedMetadata | undefined;
        return {
          ...m,
          content: [{ type: 'text', text: '' }],
          metadata: { ...m.metadata, custom: { ...existing, ...custom } },
          status: { type: 'running' },
        };
      }),
    );

  try {
    for await (const part of stream) {
      if (signal.aborted) break;

      captureMeta?.(part);
      if (part.w) warning = part.w;

      // Metadata-only frame: no renderable content. Still persist any extra
      // custom metadata (e.g. interaction/token) so attribution works before a
      // block arrives. Warning-only frames pass through below instead.
      if (!part.k && !part.c && !part.w) {
        const extra = extraCustom?.();
        if (extra) writeCustom(extra);
        continue;
      }

      currentBlocks = updateBlocks(currentBlocks, part);
      writeCustom({
        blocks: currentBlocks,
        ...(extraCustom?.() ?? {}),
        ...(warning ? { warning } : {}),
      });
    }
  } catch (error: unknown) {
    hadError = true;
    const aborted = signal.aborted;
    if (!aborted) onError?.(error);
    const message = aborted
      ? translate('Assistant message was cancelled')
      : mapError(error);
    setMessages((prev) =>
      prev.map((m) =>
        m.id === assistantId
          ? {
              ...m,
              status: {
                type: 'incomplete',
                reason: aborted ? 'cancelled' : 'error',
                error: message,
              },
            }
          : m,
      ),
    );
  } finally {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== assistantId) return m;
        // Don't overwrite an incomplete (error/cancel) status.
        if (m.status?.type === 'incomplete') return m;
        const existing = m.metadata?.custom as BlockBasedMetadata | undefined;
        const withCompletedBlocks = {
          ...m,
          metadata: {
            ...m.metadata,
            custom: {
              ...existing,
              blocks: markBlocksComplete(existing?.blocks || []),
              ...(warning ? { warning } : {}),
            },
          },
        };
        // A Stop caught by the loop-top `signal.aborted` guard (rather than a
        // thrown AbortError) reaches here with hadError=false. Mark it cancelled
        // — not complete — so a truncated reply isn't presented as finished.
        if (signal.aborted) {
          return {
            ...withCompletedBlocks,
            status: {
              type: 'incomplete',
              reason: 'cancelled',
              error: translate('Assistant message was cancelled'),
            },
          };
        }
        return {
          ...withCompletedBlocks,
          status: { type: 'complete', reason: 'stop' },
        };
      }),
    );
    if (!signal.aborted && !hadError && onComplete) onComplete();
  }
}
