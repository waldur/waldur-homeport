import {
  CheckCircleIcon,
  CircleIcon,
  LockIcon,
  WarningCircleIcon,
  XCircleIcon,
} from '@phosphor-icons/react';
import { FC, ReactNode } from 'react';

import { cn } from '../cn';
import {
  ScrollSpyItem,
  ScrollSpyNav,
  ScrollSpyNavProps,
} from '../ScrollSpy/ScrollSpyNav';
import { Tooltip } from '../Tooltip';

/**
 * Where a step of a long form stands, in the order a step nav reports it:
 * a locked step says so whatever else is true of it, an error outranks a
 * warning, and a finished step outranks a still-required one.
 */
export type StepStatus =
  'locked' | 'error' | 'warning' | 'complete' | 'required';

export interface StepNavStep {
  /** The step's section id (its `StepCard`'s `id`). */
  id: string;
  label: ReactNode;
  status?: StepStatus;
  /** What is wrong, shown in a tooltip on an `error` or `warning` icon. */
  message?: ReactNode;
}

export interface StepNavOptions {
  /** Leave out the status icons, e.g. for a read-only, submitted form. */
  hideStatusIcons?: boolean;
}

const ICON_SIZE = 20;

const StepStatusMark: FC<Pick<StepNavStep, 'status' | 'message'>> = ({
  status,
  message,
}) => {
  switch (status) {
    case 'locked':
      return (
        <LockIcon weight="bold" className="text-quaternary" size={ICON_SIZE} />
      );
    case 'error':
      return (
        <Tooltip label={message} side="left" autoWidth>
          <XCircleIcon weight="bold" size={ICON_SIZE} className="text-danger" />
        </Tooltip>
      );
    case 'warning':
      return (
        <Tooltip label={message} side="left" autoWidth>
          <WarningCircleIcon
            weight="bold"
            size={ICON_SIZE}
            className="text-warning"
          />
        </Tooltip>
      );
    case 'complete':
      return (
        <CheckCircleIcon
          weight="bold"
          className="text-success"
          size={ICON_SIZE}
        />
      );
    case 'required':
      return (
        <CircleIcon
          weight="bold"
          className="text-quaternary"
          size={ICON_SIZE}
        />
      );
    default:
      return null;
  }
};

/**
 * The `ScrollSpyNav` items for a list of steps: each title is the label with
 * the status icon at its end. A step with an error or a warning marks its
 * title `data-error`, which ScrollSpyNav turns the warning colour; a locked
 * step is muted.
 *
 * For an app that renders its own `ScrollSpyNav` (to route its links);
 * otherwise use `StepNav`.
 */
export const getStepNavItems = (
  steps: StepNavStep[],
  { hideStatusIcons }: StepNavOptions = {},
): ScrollSpyItem[] =>
  steps.map((step) => ({
    key: step.id,
    title: (
      <div
        data-error={
          step.status === 'error' || step.status === 'warning' ? '' : undefined
        }
        className={cn(
          'flex justify-between items-center w-full',
          step.status === 'locked' && 'text-quaternary',
        )}
      >
        {step.label}
        {hideStatusIcons ? null : (
          <StepStatusMark status={step.status} message={step.message} />
        )}
      </div>
    ),
  }));

export interface StepNavProps
  extends StepNavOptions, Omit<ScrollSpyNavProps, 'items' | 'tabs'> {
  steps: StepNavStep[];
}

/**
 * The side nav of a long, single-page form: one entry per step, with its
 * status, highlighting the step in view and scrolling to a step when picked.
 * Pass `renderItem` to draw the entries as your router's links.
 */
export const StepNav: FC<StepNavProps> = ({
  steps,
  hideStatusIcons,
  ...props
}) => (
  <ScrollSpyNav
    items={getStepNavItems(steps, { hideStatusIcons })}
    {...props}
  />
);
