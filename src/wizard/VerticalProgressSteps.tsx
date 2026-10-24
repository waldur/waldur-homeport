import { CheckIcon, CircleIcon } from '@phosphor-icons/react';
import classNames from 'classnames';
import { FC } from 'react';

import type { ProgressStep } from './ProgressSteps';

interface VerticalProgressStepsProps {
  steps: ProgressStep[];
  onClick?(step: ProgressStep, index: number): void;
}

const DEFAULT_VARIANT = 'primary';

// The current step's fill, by variant. `primary` is the brand, like a
// completed step; success/warning/danger read the status matrix. Exactly one
// background class per state, so two utilities never compete on one element.
const CURRENT_STEP_BG: Record<string, string> = {
  primary: 'bg-[var(--bg-brand-solid)]',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
  info: 'bg-info-600 dark:bg-info-300',
};

const CURRENT_STEP_RING: Record<string, string> = {
  primary: 'ring-4 ring-[var(--bg-brand-subtle)]',
  // eslint-disable-next-line waldur-custom/no-raw-status-ramp -- halo ring, a lighter tint than any matrix slot
  success: 'ring-4 ring-success-100 dark:ring-success-900',
  // eslint-disable-next-line waldur-custom/no-raw-status-ramp -- halo ring, a lighter tint than any matrix slot
  danger: 'ring-4 ring-error-100 dark:ring-error-900',
  // eslint-disable-next-line waldur-custom/no-raw-status-ramp -- halo ring, a lighter tint than any matrix slot
  warning: 'ring-4 ring-warning-100 dark:ring-warning-900',
  // The info ramp has no 100: ring-info-100 painted nothing in light.
  info: 'ring-4 ring-[var(--status-info-bg)]',
};

export const VerticalProgressSteps: FC<VerticalProgressStepsProps> = ({
  steps,
  onClick,
}) => (
  <ol className="m-0 list-none p-0">
    {steps.map((step, index) => {
      const isCompleted = step.completed;
      const isCurrent =
        (index === 0 && !step.completed) ||
        (steps[index - 1] && steps[index - 1].completed && !step.completed);
      const isClickable = Boolean(onClick) && (isCompleted || isCurrent);
      const variant = step.variant || DEFAULT_VARIANT;

      return (
        <li
          key={step.key ?? index}
          className={classNames(
            'relative',
            // The connector to the next step: from below this step's circle
            // to the top of the next row.
            "not-last:after:absolute not-last:after:top-[41px] not-last:after:left-[12.5px] not-last:after:h-[calc(100%-41px)] not-last:after:w-[2px] not-last:after:content-['']",
            isCompleted
              ? 'not-last:after:bg-[var(--bg-brand-solid)]'
              : 'not-last:after:bg-[var(--border-divider)]',
          )}
        >
          <button
            type="button"
            className="group flex w-full items-start gap-[1rem] border-0 bg-transparent px-0 py-[1rem] text-left transition-all duration-300 focus:outline-2 focus:outline-offset-2 focus:outline-brand focus:outline-solid disabled:cursor-not-allowed disabled:opacity-60"
            onClick={() => isClickable && onClick(step, index)}
            onKeyDown={(e) => {
              if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                onClick(step, index);
              }
            }}
            tabIndex={isClickable ? 0 : -1}
            aria-current={isCurrent ? 'step' : undefined}
            style={{ cursor: isClickable ? 'pointer' : 'not-allowed' }}
          >
            <div
              data-testid="step-marker"
              className={classNames(
                'relative z-1 flex size-[25px] shrink-0 items-center justify-center rounded-full text-white transition-all duration-300 group-enabled:group-hover:scale-105',
                isCompleted
                  ? 'bg-[var(--bg-brand-solid)]'
                  : isCurrent
                    ? (CURRENT_STEP_BG[variant] ?? 'bg-[var(--bg-brand-solid)]')
                    : 'bg-tertiary',
                isCurrent &&
                  (CURRENT_STEP_RING[variant] ?? CURRENT_STEP_RING.primary),
              )}
            >
              {step.icon ? (
                step.icon
              ) : isCompleted ? (
                <CheckIcon size={16} weight="bold" />
              ) : (
                <CircleIcon size={10} weight="fill" />
              )}
            </div>
            <div className="flex-1 pt-[0.25rem]">
              <div className="mb-[0.25rem] text-sm font-medium text-secondary group-enabled:group-hover:text-brand">
                {step.label}
              </div>
              {step.description && (
                <div className="text-sm leading-5 text-quaternary">
                  {Array.isArray(step.description)
                    ? step.description.map((line, i) => (
                        <div key={i}>{line}</div>
                      ))
                    : step.description}
                </div>
              )}
            </div>
          </button>
        </li>
      );
    })}
  </ol>
);
