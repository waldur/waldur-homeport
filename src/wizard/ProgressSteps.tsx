import { CheckIcon, CircleIcon } from '@phosphor-icons/react';
import { FC, PropsWithChildren, ReactNode } from 'react';
import { Variant } from 'react-bootstrap/esm/types';

import { cn } from 'waldur-ui';

const DEFAULT_VARIANT = 'primary';
// The current (or completed) step's fill and title colour for a non-default
// variant. Full class names, so the linter and Tailwind can read them.
const STEP_BG_CLASSES: Partial<Record<Variant, string>> = {
  danger: 'bg-danger',
  warning: 'bg-warning',
  success: 'bg-success',
  info: 'bg-info-600',
};
const STEP_TEXT_CLASSES: Partial<Record<Variant, string>> = {
  danger: 'text-danger',
  warning: 'text-warning',
  success: 'text-success',
  info: 'text-info',
};
const STEP_OUTLINE_CLASSES: Partial<Record<Variant, string>> = {
  danger: 'outline-[var(--status-danger-solid)]',
  warning: 'outline-[var(--status-warning-solid)]',
  success: 'outline-[var(--status-success-solid)]',
  info: 'outline-[var(--status-info-fg)]',
};

export interface ProgressStep {
  key?: string;
  label: any;
  description?: any;
  completed: any;
  icon?: ReactNode;
  labelClass?: string;
  variant?: Variant;
  /** Prevents this step from being auto-detected as "current" */
  disabled?: boolean;
}

interface ProgressStepsProps {
  steps: ProgressStep[];
  bgClass?: string;
  className?: string;
  onClick?(step: ProgressStep, index: number): void;
}

export const ProgressSteps: FC<PropsWithChildren<ProgressStepsProps>> = ({
  steps,
  className,
  bgClass,
  children,
  onClick,
}) => {
  return (
    <div className={cn('bg-tertiary', className, bgClass)}>
      <div className="flex flex-col items-center">
        {children}
        {/* The container lets each connector span one step's width (cqi). */}
        <div className="@container relative flex w-full flex-col">
          <div
            className="flex w-full flex-wrap items-start justify-around"
            role="list"
          >
            {steps.map((step, i) => {
              const current =
                !step.disabled &&
                ((i === 0 && !step.completed) ||
                  (steps[i - 1] && steps[i - 1].completed && !step.completed));
              const variant = step.variant || DEFAULT_VARIANT;
              const hasVariant = variant !== DEFAULT_VARIANT;
              const reached = step.completed || current;
              return (
                <div
                  key={step.key ?? i}
                  className="flex items-center justify-center"
                  // Each connector reaches back over the previous step, so
                  // earlier steps stack higher: their marker stays on top of
                  // the line that runs into it.
                  style={{
                    width: 100 / steps.length + '%',
                    zIndex: steps.length - i,
                  }}
                  role="listitem"
                  data-state={
                    step.completed
                      ? 'completed'
                      : current
                        ? 'current'
                        : 'upcoming'
                  }
                  aria-current={current ? 'step' : undefined}
                  aria-label={step.label}
                >
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        'z-[1] flex items-center justify-center rounded-full transition-colors duration-200',
                        current
                          ? 'mb-[12px] size-[26px] border-[2px] border-tertiary outline-4 outline-[var(--fg-brand-primary)]'
                          : 'mb-[14px] size-6',
                        reached
                          ? 'bg-[var(--fg-brand-primary)] text-[var(--fg-white)]'
                          : 'border-[2px] border-divider bg-primary text-senary',
                        hasVariant &&
                          (current
                            ? [
                                STEP_BG_CLASSES[variant],
                                STEP_OUTLINE_CLASSES[variant],
                              ]
                            : step.completed && STEP_BG_CLASSES[variant]),
                        Boolean(onClick) && 'cursor-pointer',
                      )}
                      onClick={() => onClick && onClick(step, i)}
                      aria-hidden="true"
                    >
                      {step.icon ? (
                        step.icon
                      ) : step.completed ? (
                        <CheckIcon size={16} weight="bold" />
                      ) : (
                        <CircleIcon size={10} weight="fill" />
                      )}
                    </div>
                    {/* A zero-width box at the marker's centre line; the
                        connector ends there and runs left to the previous
                        step's marker. The first step has none. */}
                    {i > 0 && (
                      <div className="absolute flex h-6 items-center">
                        <div
                          className={cn(
                            'absolute right-0 h-[2px]',
                            reached
                              ? 'bg-[var(--fg-brand-primary)]'
                              : 'bg-[var(--border-divider)]',
                            current && hasVariant && STEP_BG_CLASSES[variant],
                          )}
                          style={{ width: 100 / steps.length + 'cqi' }}
                        />
                      </div>
                    )}

                    <div className="flex flex-col justify-center text-center">
                      <div
                        className={cn(
                          'text-sm leading-5 font-medium',
                          current
                            ? hasVariant
                              ? STEP_TEXT_CLASSES[variant]
                              : 'text-[var(--text-brand-primary)]'
                            : 'text-secondary',
                          step.labelClass,
                        )}
                      >
                        {step.label}
                      </div>
                      {step.description && (
                        // No variant class: the design system keeps supporting
                        // text neutral whatever status the step wears, and only
                        // colours the title.
                        <div className="text-sm leading-5 text-quaternary">
                          {step.description.map((line, i) => (
                            <div key={i}>{line}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
