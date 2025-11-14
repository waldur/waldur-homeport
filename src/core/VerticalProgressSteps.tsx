import { CheckIcon, CircleIcon } from '@phosphor-icons/react';
import classNames from 'classnames';
import { FC } from 'react';

import { ProgressStep } from '@waldur/core/ProgressSteps';

import './VerticalProgressSteps.scss';

interface VerticalProgressStepsProps {
  steps: ProgressStep[];
  onClick?(step: ProgressStep, index: number): void;
}

export const VerticalProgressSteps: FC<VerticalProgressStepsProps> = ({
  steps,
  onClick,
}) => {
  const DEFAULT_VARIANT = 'primary';

  return (
    <ol className="wizard-step-indicator wizard-step-indicator-vertical">
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
            className={classNames({
              active: isCurrent,
              completed: isCompleted,
            })}
          >
            <button
              type="button"
              className="step-button"
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
                className={classNames(
                  'step w-25px h-25px',
                  isCurrent ? `bg-${variant}` : '',
                  isCurrent ? `ring-light-${variant} ring-4` : '',
                )}
              >
                {step.icon ? (
                  typeof step.icon === 'string' ? (
                    <i className={'fa ' + step.icon} />
                  ) : (
                    step.icon
                  )
                ) : isCompleted ? (
                  <CheckIcon size={16} weight="bold" />
                ) : (
                  <CircleIcon size={10} weight="fill" />
                )}
              </div>
              <div className="caption">
                <div className="step-label">{step.label}</div>
                {step.description && (
                  <div className="step-description text-muted small">
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
};
