import { CheckIcon, CircleIcon } from '@phosphor-icons/react';
import { FC, PropsWithChildren, ReactNode } from 'react';

import { cn } from 'waldur-ui';

type Variant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'danger'
  | 'warning'
  | 'info'
  | 'light'
  | 'dark';

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

/**
 * A clickable step's button: the step's own layout with the button chrome
 * taken off. The negative margin and matching padding give the focus ring
 * room around the dot and the label without moving either, so a clickable
 * step lines up with a plain one. The ring is the app's (2px, brand, 600 on
 * light and 500 on dark) and sits inside a scroll box's padding.
 */
const STEP_BUTTON_CLASSNAME = cn(
  'flex flex-col items-center',
  'appearance-none border-0 bg-transparent text-inherit cursor-pointer -m-[4px] p-[4px] rounded-[var(--focus-ring-radius,6px)]',
  'focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-[var(--focus-ring-color)] focus-visible:outline-offset-0',
);

export interface ProgressStep {
  key?: string;
  /**
   * The step's name. As a function it is told whether the step is a button,
   * so a label that is interactive itself can step back inside one: a
   * button may not hold another.
   */
  label: any;
  description?: any;
  completed: any;
  icon?: ReactNode;
  labelClass?: string;
  variant?: Variant;
  /** Prevents this step from being auto-detected as "current" */
  disabled?: boolean;
  /** False keeps the step a plain block even with `onClick`: its label holds
   *  several controls of its own. */
  clickable?: boolean;
  /** The accessible name of a clickable step: what pressing it does. */
  buttonLabel?: string;
}

interface ProgressStepsProps {
  steps: ProgressStep[];
  /** The current step by position; steps before it read as completed. Without
   *  it, each step's own `completed` decides. */
  activeIndex?: number;
  bgClass?: string;
  className?: string;
  onClick?(step: ProgressStep, index: number): void;
}

export const ProgressSteps: FC<PropsWithChildren<ProgressStepsProps>> = ({
  steps,
  activeIndex,
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
              const isControlled = typeof activeIndex === 'number';
              const completed = isControlled
                ? i < activeIndex
                : Boolean(step.completed);
              const current =
                !step.disabled &&
                (isControlled
                  ? i === activeIndex
                  : (i === 0 && !step.completed) ||
                    (steps[i - 1] &&
                      steps[i - 1].completed &&
                      !step.completed));
              const variant = step.variant || DEFAULT_VARIANT;
              const hasVariant = variant !== DEFAULT_VARIANT;
              const reached = completed || current;
              // A step that can be opened is a real button: reachable by
              // Tab, pressed with Enter or Space, ringed when focused, and
              // marked as the current step itself. One that cannot stays a
              // plain block, so it is not announced as a control. The inner
              // parts are spans, which a button may hold.
              const clickable =
                Boolean(onClick) && !step.disabled && step.clickable !== false;
              const body = (
                <>
                  <span
                    className={cn(
                      'z-[1] flex items-center justify-center rounded-full transition-colors duration-200',
                      current
                        ? 'mb-[12px] size-[26px] border-2 border-tertiary outline-4 outline-[var(--fg-brand-primary)]'
                        : 'mb-[14px] size-6',
                      reached
                        ? 'bg-[var(--fg-brand-primary)] text-[var(--fg-white)]'
                        : 'border-2 border-divider bg-primary text-senary',
                      hasVariant &&
                        (current
                          ? [
                              STEP_BG_CLASSES[variant],
                              STEP_OUTLINE_CLASSES[variant],
                            ]
                          : completed && STEP_BG_CLASSES[variant]),
                    )}
                    aria-hidden="true"
                  >
                    {step.icon ? (
                      step.icon
                    ) : completed ? (
                      <CheckIcon size={16} weight="bold" />
                    ) : (
                      <CircleIcon size={10} weight="fill" />
                    )}
                  </span>
                  {/* A zero-width box at the marker's centre line; the
                      connector ends there and runs left to the previous
                      step's marker. The first step has none. */}
                  {i > 0 && (
                    <span
                      className="absolute flex h-6 items-center"
                      aria-hidden="true"
                    >
                      <span
                        className={cn(
                          'absolute right-0 h-[2px]',
                          reached
                            ? 'bg-[var(--fg-brand-primary)]'
                            : 'bg-[var(--border-divider)]',
                          current && hasVariant && STEP_BG_CLASSES[variant],
                        )}
                        style={{ width: 100 / steps.length + 'cqi' }}
                      />
                    </span>
                  )}

                  <span className="flex flex-col justify-center text-center">
                    <span
                      className={cn(
                        'block text-sm leading-5 font-medium',
                        current
                          ? hasVariant
                            ? STEP_TEXT_CLASSES[variant]
                            : 'text-[var(--text-brand-primary)]'
                          : 'text-secondary',
                        step.labelClass,
                      )}
                    >
                      {typeof step.label === 'function'
                        ? step.label({ clickable })
                        : step.label}
                    </span>
                    {step.description && (
                      // No variant class: the design system keeps supporting
                      // text neutral whatever status the step wears, and only
                      // colours the title.
                      <span className="block text-sm leading-5 text-quaternary">
                        {step.description.map((line, i) => (
                          <span className="block" key={i}>
                            {line}
                          </span>
                        ))}
                      </span>
                    )}
                  </span>
                </>
              );
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
                    completed ? 'completed' : current ? 'current' : 'upcoming'
                  }
                  aria-current={current && !clickable ? 'step' : undefined}
                  // A label rendered as markup (a struck-through name) names
                  // the item through its own text instead.
                  aria-label={
                    typeof step.label === 'string' ? step.label : undefined
                  }
                >
                  {clickable ? (
                    <button
                      type="button"
                      className={STEP_BUTTON_CLASSNAME}
                      aria-current={current ? 'step' : undefined}
                      aria-label={step.buttonLabel}
                      onClick={() => onClick(step, i)}
                    >
                      {body}
                    </button>
                  ) : (
                    <div className="flex flex-col items-center">{body}</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
