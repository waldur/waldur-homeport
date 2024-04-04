import classNames from 'classnames';
import { FC } from 'react';

import './ProgressSteps.scss';

interface ProgressStepsProps {
  steps: Array<{
    label: any;
    description?: any;
    completed: any;
    color?: any;
  }>;
  bgClass?: string;
  className?: string;
}

export const ProgressSteps: FC<ProgressStepsProps> = ({
  steps,
  className,
  bgClass,
  children,
}) => {
  return (
    <div
      className={classNames(
        'progress-steps-view pt-8 pb-6',
        className,
        bgClass,
      )}
    >
      <div className="container-xxl d-flex flex-column align-items-center">
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
                      className={
                        'stepper-icon w-25px h-25px ' +
                        (current ? step.color || 'bg-success' : '')
                      }
                    ></div>
                    <div
                      className={classNames(
                        'stepper-line-area h-25px',
                        bgClass,
                      )}
                    >
                      <div className="stepper-line"></div>
                    </div>

                    <div className="stepper-label">
                      <h3 className="stepper-title">{step.label}</h3>
                      {step.description && (
                        <div className="stepper-desc">
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
