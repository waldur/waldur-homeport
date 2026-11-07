import { InfoIcon } from '@phosphor-icons/react';
import classNames from 'classnames';
import { FC, ReactNode, useId, useRef } from 'react';

import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
} from 'waldur-ui';

import { translate } from '@/i18n';

export interface WorkflowStepDetail {
  label: string;
  value: ReactNode;
}

interface WorkflowStepLabelProps {
  name: string;
  /** What the step is for. Lives in the popover only: inline, a paragraph
   *  under each of a dozen narrow columns made the tracker unreadable. */
  description?: string;
  details: WorkflowStepDetail[];
  open: boolean;
  onOpenChange(open: boolean): void;
  /** A step the proposal never reached. */
  struck?: boolean;
  /**
   * The step around the label is itself the button that opens the popover,
   * so the label only anchors it: a button may not hold another.
   */
  openedByStep?: boolean;
}

/**
 * A checkpoint's name on the workflow tracker, and the button that opens
 * everything else known about the step. The name is clamped to two lines
 * so that every column keeps the same height; the full name is in the
 * hover title and at the top of the popover.
 */
export const WorkflowStepLabel: FC<WorkflowStepLabelProps> = ({
  name,
  description,
  details,
  open,
  onOpenChange,
  struck,
  openedByStep,
}) => {
  const titleId = useId();
  const anchorRef = useRef<HTMLSpanElement>(null);
  const content = (
    <>
      {/* The icon inline after the last word, so a name that wraps keeps
          it beside its text rather than at the column's edge. */}
      <span className="line-clamp-2 break-words">
        <span className={classNames(struck && 'line-through')}>{name}</span>{' '}
        <InfoIcon
          size={14}
          weight="bold"
          className="inline align-[-2px] text-quaternary"
          aria-hidden="true"
        />
      </span>
    </>
  );
  const labelClassName =
    'inline-flex max-w-full px-1.5 items-start gap-1 border-0 bg-transparent py-0 text-inherit [font:inherit]';
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      {openedByStep ? (
        <PopoverAnchor asChild>
          <span ref={anchorRef} className={labelClassName} title={name}>
            {content}
          </span>
        </PopoverAnchor>
      ) : (
        <PopoverTrigger asChild>
          <button
            type="button"
            className={classNames(labelClassName, 'cursor-pointer')}
            title={name}
            aria-label={translate('{name}: step details', { name })}
          >
            {content}
          </button>
        </PopoverTrigger>
      )}
      <PopoverContent
        side="bottom"
        sideOffset={6}
        aria-labelledby={titleId}
        // A press on the step that opened it toggles it closed itself;
        // dismissing it as an outside click first would reopen it.
        onInteractOutside={(event) => {
          const step = anchorRef.current?.closest('button');
          if (step?.contains(event.target as Node)) {
            event.preventDefault();
          }
        }}
        className="w-80 max-w-[calc(100vw-32px)] p-3 text-start animate-[waldur-menu-enter-up_0.3s_ease]"
      >
        <div id={titleId} className="mb-1 font-semibold">
          {name}
        </div>
        {description && (
          <p className="text-quaternary mb-0 whitespace-pre-line">
            {description}
          </p>
        )}
        {details.length > 0 && (
          <dl className="mb-0 mt-2.5 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
            {details.map((row) => (
              <div key={row.label} className="contents">
                <dt className="font-normal text-quaternary">{row.label}</dt>
                <dd className="mb-0 break-words">{row.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </PopoverContent>
    </Popover>
  );
};
