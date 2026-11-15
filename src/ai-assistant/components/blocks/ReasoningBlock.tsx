import {
  CaretDownIcon,
  CaretRightIcon,
  LightbulbIcon,
} from '@phosphor-icons/react';
import { FC, useLayoutEffect, useState } from 'react';

import { cn } from 'waldur-ui';

import {
  SHIMMER,
  STATUS_ROW,
} from '@/ai-assistant/components/shared/statusStyles';
import { processLabel } from '@/ai-assistant/lib/blocks/statusLine';
import { uiRegistry } from '@/ai-assistant/lib/registry/uiRegistry';
import { UIBlock, UIBlockProps } from '@/ai-assistant/lib/types';
import { translate } from '@/i18n';

// More than the live preview can show. Long reasoning arrives ten times a
// second, so laying all of it out would slow the tab down.
const TAIL_CHARS = 2000;

const PROCESS_COLUMN =
  'ml-1.5 pl-3 border-l border-primary flex flex-col gap-1.5';
const REASONING_TEXT =
  'text-sm font-normal leading-[1.55] text-tertiary whitespace-pre-wrap';

const toSeconds = (ms: number) => Math.max(1, Math.round(ms / 1000));

const useElapsedMs = (startedAt: number | undefined, running: boolean) => {
  const [now, setNow] = useState(() => Date.now());
  // A layout effect, so the first frame after a pause is not drawn with the
  // time from before it.
  useLayoutEffect(() => {
    if (!running) return;
    // A grouped block can start thinking again after a pause.
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [running]);
  return startedAt ? now - startedAt : 0;
};

// Narration renders through the registry (NarrationBlock), muted.
const ProcessText: FC<{ step: UIBlock }> = ({ step }) => {
  const Component = uiRegistry.getComponent(step.key);
  return <Component block={{ ...step, status: 'complete' }} />;
};

export const ReasoningBlock: FC<UIBlockProps> = ({ block }) => {
  const isThinking = block.status === 'streaming';
  const steps = block.steps ?? [block];
  // While working, the header shows what the model last told the user it is
  // doing ("Let me check your projects…"), so that text moves up into the
  // header instead of vanishing from the reply.
  const liveLabel = processLabel(steps);
  const elapsedMs = useElapsedMs(block.startedAt, isThinking);
  // Between model calls nothing is thinking, but the reply is still working.
  // The header stays the reply's one live row until the answer starts.
  const isWorking = isThinking || !!block.working;
  // Thinking time so far; it pauses while a tool runs.
  const thinkingMs = isThinking ? elapsedMs : (block.duration_ms ?? 0);
  // Folded until the user opens it: the header says what is going on.
  const [open, setOpen] = useState(false);
  const thoughtSeconds = Math.round((block.duration_ms ?? elapsedMs) / 1000);
  const thoughtLabel = thoughtSeconds
    ? translate('Thought for {seconds}s', { seconds: thoughtSeconds })
    : translate('Thought briefly');

  return (
    <div className="flex max-w-full flex-col gap-1">
      <button
        type="button"
        className={cn(
          STATUS_ROW,
          'self-start p-0 border-0 bg-transparent cursor-pointer hover:text-primary',
        )}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <LightbulbIcon className="shrink-0" weight="bold" aria-hidden="true" />
        {isWorking ? (
          <>
            <span className={cn(SHIMMER, 'min-w-0 truncate')}>{liveLabel}</span>
            <span className="shrink-0 text-tertiary tabular-nums">
              {translate('{seconds}s', { seconds: toSeconds(thinkingMs) })}
            </span>
          </>
        ) : (
          <span>{thoughtLabel}</span>
        )}
        {open ? (
          <CaretDownIcon
            className="shrink-0"
            weight="bold"
            aria-hidden="true"
          />
        ) : (
          <CaretRightIcon
            className="shrink-0"
            weight="bold"
            aria-hidden="true"
          />
        )}
      </button>
      {open && isWorking && (
        // About four lines; older lines fade out at the top. A mask reads only
        // opacity, so any opaque colour works.
        <div
          className={cn(
            PROCESS_COLUMN,
            'justify-end max-h-[65px] overflow-hidden [mask-image:linear-gradient(to_bottom,transparent_0,currentColor_23px)]',
          )}
        >
          {/* The narration is the header's label, so this shows only
              reasoning. */}
          <div className={REASONING_TEXT}>
            {steps
              .filter((step) => step.key === 'reasoning')
              .map((step) => step.content)
              .join('\n\n')
              .slice(-TAIL_CHARS)}
          </div>
        </div>
      )}
      {open && !isWorking && (
        <div className={PROCESS_COLUMN}>
          {steps.map((step) =>
            step.key === 'reasoning' ? (
              <div key={step.id} className={REASONING_TEXT}>
                {step.content}
              </div>
            ) : (
              <ProcessText key={step.id} step={step} />
            ),
          )}
        </div>
      )}
    </div>
  );
};
