import { FC } from 'react';
import {
  OnboardingJustification,
  onboardingJustificationsList,
  ValidationDecisionEnum,
} from 'waldur-js-client';

import { Badge } from '@waldur/core/Badge';
import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';
import { renderFieldOrDash } from '@waldur/table/utils';

import { OnboardingExpandableRow } from './OnboardingExpandableRow';
import { OnboardingJustificationActions } from './OnboardingJustificationActions';

const DecisionBadge: FC<{ decision: ValidationDecisionEnum }> = ({
  decision,
}) => {
  const decisionColors = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger',
  };
  const color = decisionColors[decision] || 'secondary';
  return (
    <Badge variant={color} outline pill>
      {decision}
    </Badge>
  );
};

export const OrganizationOnboardingJustificationsList: FC = () => {
  const tableProps = useTable({
    table: 'OrganizationOnboardingJustifications',
    fetchData: createFetcher(onboardingJustificationsList),
    queryField: 'user_justification',
  });

  return (
    <Table<OnboardingJustification>
      {...tableProps}
      columns={[
        {
          title: translate('Legal name'),
          render: ({ row }) => <>{renderFieldOrDash(row.legal_name)}</>,
        },
        {
          title: translate('Registration code'),
          render: ({ row }) => (
            <>{renderFieldOrDash(row.legal_person_identifier)}</>
          ),
        },
        {
          title: translate('Decision'),
          render: ({ row }) => (
            <DecisionBadge decision={row.validation_decision} />
          ),
        },
        {
          title: translate('Staff notes'),
          render: ({ row }) => (
            <div className="text-truncate" style={{ maxWidth: '200px' }}>
              {renderFieldOrDash(row.staff_notes)}
            </div>
          ),
        },
        {
          title: translate('Created'),
          render: ({ row }) => formatDateTime(row.created),
        },
        {
          title: translate('Validated at'),
          render: ({ row }) =>
            row.validated_at
              ? formatDateTime(row.validated_at)
              : renderFieldOrDash(null),
        },
      ]}
      hasQuery={true}
      showPageSizeSelector={true}
      rowActions={OnboardingJustificationActions}
      expandableRow={OnboardingExpandableRow}
    />
  );
};
