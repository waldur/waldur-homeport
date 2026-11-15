import { FC, useEffect, useState } from 'react';

import { AlertItem } from 'waldur-ui';

import { BlockRenderer } from '@/ai-assistant/components/BlockRenderer';
import { AssistantStatusLine } from '@/ai-assistant/components/shared/AssistantStatusLine';
import {
  getWorkingProcess,
  hasWorkingProcess,
  isPlaceholder,
} from '@/ai-assistant/lib/blocks/groupProcess';
import {
  processLabel,
  toStatusLine,
} from '@/ai-assistant/lib/blocks/statusLine';
import { UIBlock } from '@/ai-assistant/lib/types';
import { translate } from '@/i18n';

const STILL_THINKING_AFTER_MS = 15_000;
// The answer usually follows the end of thinking at once; only a tool call
// leaves a gap worth labelling.
const WORKING_DELAY_MS = 300;

type Status = 'thinking' | 'working' | 'narrating' | null;

const isRunningTool = (block?: UIBlock) =>
  block?.key === 'tool' && block.status === 'loading';

// The last block with something to show. A tool without UI has nothing, and
// neither do the line breaks a model writes before a tool call, which arrive
// as their own block; groupProcess skips the same ones.
const lastShown = (blocks: UIBlock[]) =>
  blocks.filter((block) => !isPlaceholder(block)).pop();

// The status line shows only when nothing else tells the user what is going
// on: before anything arrives, and while a tool runs. A thinking header is that
// row itself until the answer starts, so it gets no second line under it. A
// form or card may be the end of the reply while the stream stays open for the
// thread title, so it gets no status line after it.
export const getStatus = (blocks: UIBlock[], isStreaming: boolean): Status => {
  if (!isStreaming || hasWorkingProcess(blocks)) return null;
  const last = lastShown(blocks);
  if (!last) return 'thinking';
  if (last.key === 'narration') return 'narrating';
  if (isRunningTool(blocks[blocks.length - 1])) return 'working';
  if (last.key === 'reasoning' && last.status !== 'streaming') {
    return 'working';
  }
  return null;
};

const useStatusLabel = (status: Status, narration: string): string | null => {
  const [workingShown, setWorkingShown] = useState(false);
  const [stillThinking, setStillThinking] = useState(false);

  useEffect(() => {
    setWorkingShown(false);
    setStillThinking(false);
    if (status === 'working') {
      const timer = setTimeout(() => setWorkingShown(true), WORKING_DELAY_MS);
      return () => clearTimeout(timer);
    }
    if (status === 'thinking') {
      const timer = setTimeout(
        () => setStillThinking(true),
        STILL_THINKING_AFTER_MS,
      );
      return () => clearTimeout(timer);
    }
  }, [status]);

  if (status === 'narrating') return narration || translate('Working on it…');
  if (status === 'working') {
    return workingShown ? translate('Working on it…') : null;
  }
  if (status === 'thinking') {
    return stillThinking
      ? translate('Still thinking…')
      : translate('Thinking…');
  }
  return null;
};

interface AssistantMessageContentProps {
  blocks: UIBlock[];
  warning?: string;
  // Whether THIS message is the one actively generating. Gating the status
  // line on the message's own status (not the thread-wide `isRunning`) keeps an
  // earlier no-block bubble — an errored turn or a standalone PII/redaction
  // warning — from showing it while a newer turn streams.
  isStreaming: boolean;
}

// Shared body of an assistant message: the redaction/PII warning badge, the
// blocks and the status line. Composed by both the authenticated and anonymous
// threads so this gating logic lives in exactly one place.
export const AssistantMessageContent: FC<AssistantMessageContentProps> = ({
  blocks,
  warning,
  isStreaming,
}) => {
  const status = getStatus(blocks, isStreaming);
  const label = useStatusLabel(
    status,
    toStatusLine(lastShown(blocks)?.content ?? ''),
  );
  // While a thinking header is the status row, this region announces its label
  // (not every second of its timer), so the reply keeps one live region.
  const working = isStreaming ? getWorkingProcess(blocks) : undefined;
  const announced = working ? processLabel(working.steps ?? [working]) : label;

  return (
    <>
      {warning && (
        <AlertItem
          variant="warning"
          title={translate('Sensitive information detected')}
          body={warning}
        />
      )}
      <BlockRenderer blocks={blocks} isStreaming={isStreaming} />
      {label && (
        <AssistantStatusLine label={label} working={status !== 'thinking'} />
      )}
      {isStreaming && (
        // Mounted for the whole reply: screen readers often skip a live region
        // that is inserted with its text, but read every change inside one.
        // Out of the layout, so it adds no gap below the thinking header.
        <span className="sr-only" role="status">
          {announced}
        </span>
      )}
    </>
  );
};
