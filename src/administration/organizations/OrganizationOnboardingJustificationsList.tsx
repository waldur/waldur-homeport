import { FC } from 'react';
import {
  OnboardingJustification,
  OnboardingJustificationsListData,
  onboardingJustificationsList,
  ValidationDecisionEnum,
} from 'waldur-js-client';

import { Badge } from '@/core/Badge';
import { formatDateTime } from '@/core/dateUtils';
import { translate } from '@/i18n';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

import { OnboardingJustificationActions } from './OnboardingJustificationActions';
import { OnboardingJustificationExpandableRow } from './OnboardingJustificationExpandableRow';

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
    <Badge variant={color} pill outline>
      {decision}
    </Badge>
  );
};

export const OrganizationOnboardingJustificationsList: FC = () => {
  const filter: OnboardingJustificationsListData['query'] = {
    o: ['-created'],
  };

  const tableProps = useTable({
    table: 'OrganizationOnboardingJustifications',
    fetchData: createFetcher(onboardingJustificationsList),
    filter,
    queryField: 'query',
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
          orderField: 'created',
        },
        {
          title: translate('Validated at'),
          render: ({ row }) =>
            row.validated_at
              ? formatDateTime(row.validated_at)
              : renderFieldOrDash(null),
          orderField: 'validated_at',
        },
      ]}
      hasQuery={true}
      showPageSizeSelector={true}
      rowActions={OnboardingJustificationActions}
      expandableRow={OnboardingJustificationExpandableRow}
    />
  );
};
