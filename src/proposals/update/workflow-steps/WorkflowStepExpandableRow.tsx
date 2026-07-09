import { FC } from 'react';
import { CallWorkflowStep, ResponsibleRoleEnum } from 'waldur-js-client';

import { translate } from '@/i18n';
import { AllocationTime } from '@/proposals/types';
import { formatAllocationTime } from '@/proposals/utils';
import {
  responsibleRoleLabel,
  transitionModeLabel,
} from '@/proposals/workflow/constants';
import { Field } from '@/resource/summary';
import { ExpandableContainer } from '@/table/ExpandableContainer';

interface OwnProps {
  row: CallWorkflowStep;
}

const renderOptions = (row: CallWorkflowStep) => {
  const flags: string[] = [];
  if (row.blind_review) flags.push(translate('Blind review'));
  if (row.requires_coi_confirmation)
    flags.push(translate('Conflict-of-interest confirmation'));
  if (row.applicant_visible) flags.push(translate('Visible to applicant'));
  if (row.include_award_response) flags.push(translate('Award response'));
  return flags.length ? flags.join(', ') : undefined;
};

const labelOrUndefined = (value: string) => (value === '—' ? undefined : value);

const renderCriteria = (row: CallWorkflowStep) => {
  const list = (row.criteria ?? [])
    .slice()
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  if (list.length === 0) return undefined;
  return (
    <ul className="list-unstyled mb-0">
      {list.map((c, index) => (
        <li key={`${c.name}-${index}`}>{c.name}</li>
      ))}
    </ul>
  );
};

export const WorkflowStepExpandableRow: FC<OwnProps> = ({ row }) => {
  const optionsValue = renderOptions(row);
  const criteriaValue = renderCriteria(row);
  return (
    <ExpandableContainer asTable>
      <Field
        label={translate('Checklist')}
        value={row.checklist_name || undefined}
      />
      <Field
        label={translate('Responsible role')}
        value={labelOrUndefined(
          responsibleRoleLabel(
            row.responsible_role as ResponsibleRoleEnum | null,
          ),
        )}
      />
      <Field
        label={translate('Transition mode')}
        value={labelOrUndefined(transitionModeLabel(row.transition_mode))}
      />
      <Field
        label={translate('Min reviews')}
        value={
          row.min_reviewers != null ? String(row.min_reviewers) : undefined
        }
      />
      <Field
        label={translate('Min score')}
        value={row.min_score_threshold || undefined}
      />
      {row.step === 'allocation_decision' && (
        <Field
          label={translate('Allocation timing')}
          value={formatAllocationTime(
            (row.allocation_time || 'on_decision') as AllocationTime,
          )}
        />
      )}
      <Field label={translate('Criteria')} value={criteriaValue} />
      <Field label={translate('Options')} value={optionsValue} />
    </ExpandableContainer>
  );
};
