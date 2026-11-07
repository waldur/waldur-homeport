import { FC, useMemo, useRef, useState } from 'react';
import { WorkflowDescription } from 'waldur-js-client';

import { Select } from 'waldur-ui';

import { formatDate } from '@/core/dateUtils';
import { translate } from '@/i18n';

import { PanelHeaderControls } from '../PanelHeaderControls';

import { postAwardPlans, roundPlans } from './schedule';
import { ScrollRegion } from './ScrollRegion';
import { ExportButtons } from './WorkflowDiagramPanel';
import { WorkflowGantt } from './WorkflowGantt';

import './WorkflowDiagram.scss';

const sourceLabel = (source: string | null) =>
  ({
    allocation_date: translate(
      "from the round's cut-off to its allocation date",
    ),
    target_decision_days: translate("the call's target time to decision"),
    review_duration_in_days: translate("the round's review duration"),
  })[source ?? ''] ?? '';

/**
 * The planned timeline of the workflow per round: whether its steps fit
 * between the round's cut-off and the decision. Steps of a stage run
 * together, a stage ends with its longest step, and the critical path is
 * drawn darker; bars past the decision are red.
 */
export const WorkflowTimelinePanel: FC<{
  description: WorkflowDescription;
  name: string;
}> = ({ description, name }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const plans = useMemo(() => roundPlans(description), [description]);
  const afterAward = useMemo(() => postAwardPlans(description), [description]);
  const [index, setIndex] = useState(0);
  const plan = plans[Math.min(index, plans.length - 1)];
  const options = plans.map((candidate, position) => ({
    value: position,
    label:
      candidate.name ||
      (candidate.cutoff
        ? translate('Round with cut-off {date}', {
            date: formatDate(candidate.cutoff),
          })
        : translate('Round {number}', { number: position + 1 })),
  }));
  return (
    <div data-testid="workflow-timeline-panel">
      <PanelHeaderControls className="flex flex-wrap items-center gap-2.5 mb-2.5">
        {plans.length > 1 ? (
          <div style={{ minWidth: 240 }}>
            <Select
              aria-label={translate('Round')}
              options={options}
              value={options[index]}
              onChange={(option: any) => setIndex(option?.value ?? 0)}
              isClearable={false}
              isSearchable={false}
            />
          </div>
        ) : null}
        <div className="ms-auto flex gap-1.5">
          <ExportButtons
            getSvg={() => svgRef.current}
            name={`${name}-timeline`}
          />
        </div>
      </PanelHeaderControls>
      <p className="mb-1.5" data-testid="timeline-summary">
        {translate('The critical path takes {days} days.', {
          days: plan.totalDays,
        })}{' '}
        {plan.decisionDay != null ? (
          <>
            {translate('The decision is due after {days} days ({source}).', {
              days: plan.decisionDay,
              source: sourceLabel(plan.decisionSource),
            })}{' '}
            {plan.overrunDays ? (
              <strong className="text-danger" data-testid="timeline-overrun">
                {translate('It runs {days} days over.', {
                  days: plan.overrunDays,
                })}
              </strong>
            ) : (
              // The 700 step: the success colour itself is under 4.5:1.
              <span className="text-success">{translate('It fits.')}</span>
            )}
          </>
        ) : (
          <span className="text-quaternary">
            {translate(
              "No decision date is known: set the round dates or the call's target time to decision.",
            )}
          </span>
        )}
      </p>
      {plan.openEnded ? (
        <p className="text-quaternary text-xs mb-1.5">
          {translate(
            "An open-ended round has no cut-off: days count from each proposal's submission.",
          )}
        </p>
      ) : null}
      {description.schedule.steps_without_duration.length ? (
        <p className="text-quaternary text-xs mb-1.5">
          {translate(
            'Steps without a duration are drawn as points and add no time: {steps}.',
            {
              steps: description.schedule.steps_without_duration
                .map(
                  (key) =>
                    description.steps.find((step) => step.key === key)?.name ??
                    key,
                )
                .join(', '),
            },
          )}
        </p>
      ) : null}
      <ScrollRegion
        className="workflow-diagram-scroll"
        label={translate('Planned timeline')}
      >
        <WorkflowGantt plan={plan} svgRef={svgRef} />
      </ScrollRegion>
      {afterAward.map((phasePlan) => (
        <div
          key={phasePlan.phase}
          className="mt-3"
          data-testid={`timeline-${phasePlan.phase}`}
        >
          <h6 className="mb-1">
            {phasePlan.phase === 'extension'
              ? translate('After the award: extension request')
              : translate('After the award: final report')}
          </h6>
          <p className="text-quaternary text-xs mb-1.5">
            {phasePlan.phase === 'extension'
              ? phasePlan.projectEndOffsetDays != null
                ? translate(
                    "Each time the team asks to extend, up to {days} days before the project's end. It takes {total} days.",
                    {
                      days: phasePlan.projectEndOffsetDays,
                      total: phasePlan.totalDays,
                    },
                  )
                : translate(
                    "Each time the team asks to extend, until the project's end. It takes {total} days.",
                    { total: phasePlan.totalDays },
                  )
              : translate(
                  "Opens {days} days before the project's end. It takes {total} days.",
                  {
                    days: phasePlan.projectEndOffsetDays ?? 0,
                    total: phasePlan.totalDays,
                  },
                )}
          </p>
          <ScrollRegion
            className="workflow-diagram-scroll"
            label={
              phasePlan.phase === 'extension'
                ? translate('After the award: extension request')
                : translate('After the award: final report')
            }
          >
            <WorkflowGantt plan={phasePlan} />
          </ScrollRegion>
        </div>
      ))}
    </div>
  );
};
