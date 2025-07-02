import { CheckIcon, CircleIcon } from '@phosphor-icons/react';
import classNames from 'classnames';
import { FC, PropsWithChildren, ReactNode } from 'react';
import { Variant } from 'react-bootstrap/esm/types';

import './ProgressSteps.scss';

const DEFAULT_VARIANT = 'primary';

export interface ProgressStep {
  key?: string;
  label: any;
  description?: any;
  completed: any;
  icon?: ReactNode;
  labelClass?: string;
  variant?: Variant;
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
    <div className={classNames('progress-steps-view', className, bgClass)}>
      <div className="d-flex flex-column align-items-center">
        {children}
        <div className="stepper stepper-pills d-flex flex-column w-100">
          <div className="stepper-nav flex-wrap align-items-start justify-content-around w-100">
            {steps.map((step, i) => {
              const current =
                (i === 0 && !step.completed) ||
                (steps[i - 1] && steps[i - 1].completed && !step.completed);
              const variant = step.variant || DEFAULT_VARIANT;
              return (
                <div
                  key={step.key ?? i}
                  className={
                    'stepper-item' +
                    (step.completed ? ' completed' : current ? ' current' : '')
                  }
                  style={{ width: 100 / steps.length + '%' }}
                >
                  <div className="stepper-wrapper d-flex flex-column align-items-center">
                    <div
                      className={classNames(
                        'stepper-icon w-25px h-25px',
                        current ? `bg-${variant}` : '',
                        current ? `ring-light-${variant} ring-4` : '',
                        Boolean(onClick) && 'cursor-pointer',
                      )}
                      onClick={() => onClick(step, i)}
                      aria-hidden="true"
                    >
                      {step.icon ? (
                        typeof step.icon === 'string' ? (
                          <i className={'fa ' + step.icon} />
                        ) : (
                          step.icon
                        )
                      ) : step.completed ? (
                        <CheckIcon size={16} weight="bold" />
                      ) : (
                        <CircleIcon size={10} weight="fill" />
                      )}
                    </div>
                    <div
                      className={classNames(
                        'stepper-line-area h-25px',
                        bgClass,
                      )}
                    >
                      <div
                        className={classNames(
                          'stepper-line',
                          current && `bg-${variant}`,
                        )}
                        style={{ width: 100 / steps.length + 'vw' }}
                      />
                    </div>

                    <div className="stepper-label">
                      <div
                        className={classNames(
                          'stepper-title h3',
                          current && `text-${variant}-700`,
                          step.labelClass,
                        )}
                      >
                        {step.label}
                      </div>
                      {step.description && (
                        <div
                          className={classNames(
                            'stepper-desc',
                            current && `text-${variant}`,
                          )}
                        >
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
