import { WarningCircleIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { CallWorkflowStep } from 'waldur-js-client';

import { Badge, PropertyItem } from 'waldur-ui';

import { Link } from '@/core/Link';
import { translate } from '@/i18n';
import { propVal } from '@/property/propertyFields';
import { getAllocationTimeOptions } from '@/proposals/utils';
import {
  getResponsibleRoleLabels,
  getTransitionModeLabels,
} from '@/proposals/workflow/constants';
import { ExpandableContainer } from '@/table/ExpandableContainer';

interface OwnProps {
  row: CallWorkflowStep;
}

const getOptions = (row: CallWorkflowStep) => {
  const flags: string[] = [];
  if (row.blind_review) flags.push(translate('Blind review'));
  if (row.requires_coi_confirmation)
    flags.push(translate('Conflict-of-interest confirmation'));
  if (row.applicant_visible) flags.push(translate('Visible to applicant'));
  if (row.include_award_response) flags.push(translate('Award response'));
  return flags;
};

const getCriteria = (row: CallWorkflowStep) =>
  (row.criteria ?? [])
    .slice()
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((c) => c.name);

// Who will act on the step: the backend resolves the responsible role to
// users (call roles, or offering managers of offerings accepted into the
// call), so the call manager sees names instead of a role label.
const renderEvaluators = (row: CallWorkflowStep) => {
  if (row.responsible_role === 'applicant') {
    return translate('The applicant of each proposal');
  }
  const users = row.responsible_users ?? [];
  if (users.length === 0) {
    return (
      <span className="text-warning inline-flex items-center gap-1">
        {}
        <WarningCircleIcon weight="bold" />
        {translate('Nobody holds this role yet.')}{' '}
        <Link
          state="protected-call.main"
          params={{ tab: 'team' }}
          label={translate('Assign in the Team tab')}
        />
      </span>
    );
  }
  return (
    <ul className="list-unstyled mb-0">
      {users.map((user) => (
        <li key={user.uuid} className="flex items-center gap-1.5">
          <span>{user.full_name || user.username}</span>
          <span className="text-quaternary">
            {user.username} · {user.email}
          </span>
          {user.is_panel_chair && (
            <Badge variant="primary" size="sm" shape="pill" tone="outline">
              {translate('Chair')}
            </Badge>
          )}
        </li>
      ))}
    </ul>
  );
};

export const WorkflowStepExpandableRow: FC<OwnProps> = ({ row }) => {
  return (
    <ExpandableContainer asTable>
      <PropertyItem label={translate('Checklist')} value={row.checklist_name} />
      <PropertyItem
        label={translate('Responsible role')}
        value={propVal.enum(row.responsible_role, {
          labels: getResponsibleRoleLabels(),
        })}
      />
      <PropertyItem
        label={translate('Evaluators')}
        value={renderEvaluators(row)}
      />
      <PropertyItem
        label={translate('Transition mode')}
        value={propVal.enum(row.transition_mode, {
          labels: getTransitionModeLabels(),
        })}
      />
      <PropertyItem
        label={translate('Min reviews')}
        value={propVal.number(row.min_reviewers)}
      />
      <PropertyItem
        label={translate('Min score')}
        value={row.min_score_threshold}
      />
      {row.step === 'allocation_decision' && (
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
  );
};
