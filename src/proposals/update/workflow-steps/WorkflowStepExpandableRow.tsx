import { FC, useContext } from 'react';
import { CallWorkflowStep } from 'waldur-js-client';

import { PropertyItem } from 'waldur-ui';

import { translate } from '@/i18n';
import { propVal } from '@/property/propertyFields';
import { StaffingWarning } from '@/proposals/proposal-roles/StaffingWarning';
import { criterionLabel } from '@/proposals/review/criteriaScore';
import { getAllocationTimeOptions } from '@/proposals/utils';
import {
  contributorSourceLabel,
  getResponsibleRoleLabels,
  getTransitionModeLabels,
  hasNegativeOutcome,
  onNegativeLabel,
  outcomeLabel,
} from '@/proposals/workflow/constants';
import { useWorkflowStepKinds } from '@/proposals/workflow/queries';
import { ExpandableContainer } from '@/table/ExpandableContainer';

import { StepEvaluators, WorkflowStepsContext } from './StepEvaluators';

interface OwnProps {
  row: CallWorkflowStep;
  /** Reloads the steps table, given by the table to its expanded rows. */
  fetch?(): void;
}

const getOptions = (row: CallWorkflowStep) => {
  const flags: string[] = [];
  if (row.blind_review) flags.push(translate('Blind review'));
  if (row.requires_coi_confirmation)
    flags.push(translate('Conflict-of-interest confirmation'));
  if (row.applicant_visible) flags.push(translate('Visible to applicant'));
  return flags;
};

const getCriteria = (row: CallWorkflowStep) => {
  const criteria = (row.criteria ?? [])
    .slice()
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  return criteria.map((c) => criterionLabel(c, criteria));
};

export const WorkflowStepExpandableRow: FC<OwnProps> = ({ row, fetch }) => {
  const context = useContext(WorkflowStepsContext);
  const { data: kinds } = useWorkflowStepKinds();
  const kind = kinds?.find((k) => k.id === row.kind);
  const outcomes = (row.allowed_outcomes ?? []).map(outcomeLabel).join(' / ');
  return (
    <>
      <ExpandableContainer asTable>
        <PropertyItem
          label={translate('Description')}
          value={row.description}
        />
        <PropertyItem label={translate('Outcomes')} value={outcomes} />
        {hasNegativeOutcome(kind, row.outcome_set) && row.on_negative && (
          <PropertyItem
            label={translate('On a negative outcome')}
            value={onNegativeLabel(row.on_negative)}
          />
        )}
        <PropertyItem
          label={translate('Checklist')}
          value={row.checklist_name}
        />
        <PropertyItem
          label={translate('Responsible role')}
          value={propVal.enum(row.completer, {
            labels: getResponsibleRoleLabels(),
          })}
        />
        {row.contributors_warning && (
          <PropertyItem
            label={translate('Staffing')}
            value={<StaffingWarning warning={row.contributors_warning} />}
          />
        )}
        <PropertyItem
          label={translate('Transition mode')}
          value={propVal.enum(row.transition_mode, {
            labels: getTransitionModeLabels(),
          })}
        />
        {row.parallel_with_previous && (
          <PropertyItem
            label={translate('Runs')}
            value={translate('Alongside the previous step')}
          />
        )}
        {row.run_condition?.step && (
          <PropertyItem
            label={translate('Runs only when')}
            value={
              row.run_condition.score_spread_above != null
                ? translate(
                    'the scores of {step} lie more than {points} apart',
                    {
                      step:
                        row.run_condition_step_name || row.run_condition.step,
                      points: row.run_condition.score_spread_above,
                    },
                  )
                : translate('{step} ends with {outcomes}', {
                    // The step by name; the stored condition keeps its key.
                    step: row.run_condition_step_name || row.run_condition.step,
                    outcomes: (row.run_condition.outcomes ?? [])
                      .map(outcomeLabel)
                      .join(', '),
                  })
            }
          />
        )}
        {row.requires_coi_confirmation && row.coi_declaration_text && (
          <PropertyItem
            label={translate('Conflict-of-interest declaration')}
            value={row.coi_declaration_text}
          />
        )}
        {row.contributor_source && row.contributor_source !== 'none' && (
          <PropertyItem
            label={translate('Contributors')}
            value={
              row.per_requested_offering
                ? translate('One contribution per requested offering')
                : contributorSourceLabel(row.contributor_source)
            }
          />
        )}
        <PropertyItem
          label={
            row.contributor_source && row.contributor_source !== 'none'
              ? translate('Min contributions')
              : translate('Min reviews')
          }
          value={propVal.number(row.min_contributions)}
        />
        <PropertyItem
          label={translate('Max contributions')}
          value={propVal.number(row.max_contributions)}
        />
        <PropertyItem
          label={translate('Min score')}
          value={row.min_score_threshold}
        />
        {row.is_allocation_decision && (
          <PropertyItem
            label={translate('Allocation timing')}
            value={propVal.enum(row.allocation_time || 'on_decision', {
              options: getAllocationTimeOptions(),
            })}
          />
        )}
        <PropertyItem
          label={translate('Criteria')}
          value={propVal.list(getCriteria(row), { display: 'stack' })}
        />
        <PropertyItem
          label={translate('Options')}
          value={propVal.list(getOptions(row))}
        />
      </ExpandableContainer>
      {/* Its own container, outside the field table, so it keeps to the
        visible width and its table scrolls within it on a phone. */}
      <ExpandableContainer>
        <StepEvaluators step={row} refetch={fetch} {...context} />
      </ExpandableContainer>
    </>
  );
};
