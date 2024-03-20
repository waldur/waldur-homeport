import classNames from 'classnames';
import { FC, useMemo } from 'react';

import { translate } from '@waldur/i18n';
import './ProgressSteps.scss';
import { Proposal } from '@waldur/proposals/types';

interface ProgressStepsProps {
  proposal: Proposal;
  bgClass?: string;
  className?: string;
}

const getSteps = (proposal: Proposal) => {
  const steps: Array<{ label; description?; completed; color? }> = [];
  steps.push({
    label: translate('Submission'),
    completed: proposal.state === 'submitted',
  });
  steps.push(
    {
      label: translate('Verify team'),
      completed: proposal.state === 'in_review',
    },
    {
      label: translate('Review'),
      completed: proposal.state === 'in_revision',
    },
    {
      label: translate('Updates'),
      completed: proposal.state === 'in_revision',
    },
    {
      label: translate('Accepted'),
      completed: proposal.state === 'accepted',
    },
  );
  return steps;
};

export const ProgressSteps: FC<ProgressStepsProps> = ({
  proposal,
  className,
  bgClass,
}) => {
  const steps = useMemo(() => getSteps(proposal), [proposal]);
  return (
    <div
      className={classNames(
        'progress-steps-view pt-8 pb-6',
        className,
        bgClass,
      )}
    >
      <div className="container-xxl d-flex flex-column align-items-center">
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
