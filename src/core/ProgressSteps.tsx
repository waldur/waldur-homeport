import { Check, Circle } from '@phosphor-icons/react';
import classNames from 'classnames';
import { FC, PropsWithChildren, ReactNode } from 'react';
import { Variant } from 'react-bootstrap/esm/types';

import './ProgressSteps.scss';

interface ProgressStepsProps {
  steps: Array<{
    label: any;
    description?: any;
    completed: any;
    icon?: ReactNode;
    labelClass?: string;
    variant?: Variant;
  }>;
  bgClass?: string;
  className?: string;
}

export const ProgressSteps: FC<PropsWithChildren<ProgressStepsProps>> = ({
  steps,
  className,
  bgClass,
  children,
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
              return (
                <div
                  key={i}
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
                        current ? `bg-${step.variant || 'warning'}` : '',
                        current
                          ? `ring-light-${step.variant || 'warning'} ring-4`
                          : '',
                      )}
                    >
                      {step.icon ? (
                        typeof step.icon === 'string' ? (
                          <i className={'fa ' + step.icon} />
                        ) : (
                          step.icon
                        )
                      ) : step.completed ? (
                        <Check size={16} weight="bold" />
                      ) : (
                        <Circle size={10} weight="fill" />
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
                          current && `bg-${step.variant || 'warning'}`,
                        )}
                        style={{ width: 100 / steps.length + 'vw' }}
                      />
                    </div>

                    <div className="stepper-label">
                      <div
                        className={classNames(
                          'stepper-title h3',
                          current && `text-${step.variant || 'warning'}`,
                          step.labelClass,
                        )}
                      >
                        {step.label}
                      </div>
                      {step.description && (
                        <div
                          className={classNames(
                            'stepper-desc',
                            current && `text-${step.variant || 'warning'}`,
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
