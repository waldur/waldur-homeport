import { ArrowsSplitIcon, CircleIcon } from '@phosphor-icons/react';
import classNames from 'classnames';
import { FC, ReactNode, useMemo, useState } from 'react';
import { CallWorkflowStep, ResponsibleRoleEnum } from 'waldur-js-client';

import { PropertyCard } from 'waldur-ui';

import { translate } from '@/i18n';
import {
  WorkflowStepDetail,
  WorkflowStepLabel,
} from '@/proposals/proposal/WorkflowStepLabel';
import {
  responsibleRoleLabel,
  sortByOrder,
  stepName,
  TransitionModeEnum,
  transitionModeLabel,
} from '@/proposals/workflow/constants';
import { configuredStages } from '@/proposals/workflow/stages';
import { ScrollRegion } from '@/proposals/workflow-description/diagram/ScrollRegion';

import './WorkflowSequencePreview.scss';

/** Narrowest a stage column gets before the sequence scrolls instead. */
const STAGE_MIN_WIDTH = 160;

/** A step as the preview needs it: a call's step, or a template's summary. */
type SequenceStep = Pick<
  CallWorkflowStep,
  'uuid' | 'name' | 'order' | 'is_enabled'
> &
  Partial<
    Pick<
      CallWorkflowStep,
      | 'key'
      | 'kind'
      | 'duration_in_days'
      | 'completer'
      | 'transition_mode'
      | 'parallel_with_previous'
    >
  >;

const StepDetails: FC<{ step: SequenceStep }> = ({ step }) => (
  <>
    <div className="text-quaternary text-xs mt-1">
      {step.duration_in_days
        ? translate('{count}d', {
            count: step.duration_in_days,
          })
        : translate('No deadline')}
    </div>
    {step.completer ? (
      <div className="text-quaternary text-xs">
        {responsibleRoleLabel(step.completer as ResponsibleRoleEnum | null)}
      </div>
    ) : null}
    <div className="text-quaternary text-xs">
      {transitionModeLabel(
        (step.transition_mode ||
          'automatic_on_completion') as TransitionModeEnum,
      )}
    </div>
  </>
);

interface WorkflowSequencePreviewProps {
  steps: SequenceStep[];
  onReset?(): void;
  title?: string;
  description?: string;
  /** What is shown under each step's name; a call step's deadline, completer and transition by default. */
  renderDetails?(step: SequenceStep): ReactNode;
  /** What the step does, kept behind an info icon next to its name so that
   *  long explanations don't stretch every column. */
  describe?(step: SequenceStep): {
    description?: string;
    details?: WorkflowStepDetail[];
  } | null;
}

export const WorkflowSequencePreview: FC<WorkflowSequencePreviewProps> = ({
  steps,
  onReset,
  title,
  description,
  renderDetails,
  describe,
}) => {
  const [openStep, setOpenStep] = useState<string | null>(null);
  // The enabled steps, in the order the engine runs them, in their stages:
  // steps of one stage start together and share one column.
  const stages = useMemo(
    () =>
      configuredStages(sortByOrder(steps))
        .map((stage) => stage.filter((s) => s.is_enabled))
        .filter((stage) => stage.length > 0),
    [steps],
  );

  if (stages.length === 0) {
    return null;
  }

  const renderStep = (configured: SequenceStep) => {
    const explained = describe?.(configured);
    return (
      <>
        <div className="mt-2.5 font-medium text-xs text-secondary">
          {explained ? (
            <WorkflowStepLabel
              name={stepName(configured)}
              description={explained.description}
              details={explained.details ?? []}
              open={openStep === configured.uuid}
              onOpenChange={(open) =>
                setOpenStep(open ? configured.uuid : null)
              }
            />
          ) : (
            stepName(configured)
          )}
        </div>
        {renderDetails ? (
          renderDetails(configured)
        ) : (
          <StepDetails step={configured} />
        )}
      </>
    );
  };

  return (
    <PropertyCard
      bordered
      title={title ?? translate('Preview sequence')}
      refetch={onReset}
    >
      <p className="text-quaternary text-xs mb-4">
        {description ??
          translate(
            'Shows the enabled steps above in the order proposals go through them.',
          )}
      </p>
      {/* Each stage keeps a readable minimum width; past what the card
          holds, the sequence scrolls sideways instead of overflowing the
          page. */}
      <ScrollRegion
        className="overflow-x-auto pb-1.5"
        label={translate('Step sequence')}
      >
        <ol
          className="workflow-sequence"
          style={{
            gridTemplateColumns: `repeat(${stages.length}, minmax(${STAGE_MIN_WIDTH}px, 1fr))`,
            minWidth: stages.length * STAGE_MIN_WIDTH,
          }}
        >
          {stages.map((stage, index) => {
            const parallel = stage.length > 1;
            return (
              <li
                key={stage[0].uuid}
                className={classNames('workflow-sequence__node', {
                  'workflow-sequence__node--parallel': parallel,
                })}
                data-testid={parallel ? 'parallel-stage' : undefined}
              >
                {index < stages.length - 1 && (
                  <span className="workflow-sequence__connector" aria-hidden />
                )}
                {parallel ? (
                  // Sits on the line where a single step has its bullet, so
                  // the names of every column start at the same height.
                  <span className="workflow-sequence__marker" aria-hidden>
                    <ArrowsSplitIcon size={12} weight="bold" />
                    {translate('Runs in parallel')}
                  </span>
                ) : (
                  <span className="workflow-sequence__bullet" aria-hidden>
                    <CircleIcon
                      weight="fill"
                      size={10}
                      className="text-quaternary block"
                    />
                  </span>
                )}
                {parallel ? (
                  <ul
                    className="workflow-sequence__parallel"
                    aria-label={translate(
                      '{count} steps that run in parallel',
                      { count: stage.length },
                    )}
                  >
                    {stage.map((configured) => (
                      <li
                        key={configured.uuid}
                        className="workflow-sequence__step"
                      >
                        {renderStep(configured)}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="workflow-sequence__step">
                    {renderStep(stage[0])}
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </ScrollRegion>
    </PropertyCard>
  );
};
