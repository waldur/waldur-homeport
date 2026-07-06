import { FC } from 'react';

import { BlockRenderer } from '@/ai-assistant/components/BlockRenderer';
import { LoadingDots } from '@/ai-assistant/components/shared/LoadingDots';
import { UIBlock } from '@/ai-assistant/lib/types';
import { AlertItem } from '@/core/AlertItem';
import { translate } from '@/i18n';

interface AssistantMessageContentProps {
  blocks: UIBlock[];
  warning?: string;
  // Whether THIS message is the one actively generating. Gating the loading
  // dots on the message's own status (not the thread-wide `isRunning`) keeps an
  // earlier no-block bubble — an errored turn or a standalone PII/redaction
  // warning — from showing dots while a newer turn streams.
  isStreaming: boolean;
}

// Shared body of an assistant message: the redaction/PII warning badge plus the
// block-or-loading region. Composed by both the authenticated and anonymous
// threads so this gating logic lives in exactly one place.
export const AssistantMessageContent: FC<AssistantMessageContentProps> = ({
  blocks,
  warning,
  isStreaming,
}) => (
  <>
    {warning && (
      <AlertItem
        variant="warning"
        title={translate('Sensitive information detected')}
        body={warning}
      />
    )}
    {blocks.length === 0 && isStreaming ? (
      <LoadingDots />
    ) : (
      <BlockRenderer blocks={blocks} />
    )}
  </>
);
