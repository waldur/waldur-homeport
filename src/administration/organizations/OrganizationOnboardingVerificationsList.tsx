import { QuestionIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import {
  OnboardingVerification,
  onboardingVerificationsList,
  OnboardingVerificationStatusEnum,
} from 'waldur-js-client';

import { Badge } from '@waldur/core/Badge';
import { formatDateTime } from '@waldur/core/dateUtils';
import { Tip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';
import { createFetcher } from '@waldur/table/api';
import { BooleanField } from '@waldur/table/BooleanField';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';
import { renderFieldOrDash } from '@waldur/table/utils';

import { OnboardingVerificationActions } from './OnboardingVerificationActions';
import { OnboardingVerificationExpandableRow } from './OnboardingVerificationExpandableRow';

const StatusBadge: FC<{ status: OnboardingVerificationStatusEnum }> = ({
  status,
}) => {
  const statusColors = {
    pending: 'warning',
    verified: 'success',
    failed: 'danger',
    escalated: 'info',
    expired: 'secondary',
  };
  const color = statusColors[status] || 'secondary';
  return (
    <Badge variant={color} pill outline>
      {status}
    </Badge>
  );
};

export const OrganizationOnboardingVerificationsList: FC = () => {
  const tableProps = useTable({
    table: 'OrganizationOnboardingVerifications',
    fetchData: createFetcher(onboardingVerificationsList),
    queryField: 'legal_name',
  });

  return (
    <Table<OnboardingVerification>
      {...tableProps}
      columns={[
        {
          title: translate('Legal name'),
          render: ({ row }) => renderFieldOrDash(row.legal_name),
          copyField: (row) => row.legal_name,
        },
        {
          title: translate('Registration code'),
          render: ({ row }) => renderFieldOrDash(row.legal_person_identifier),
          copyField: (row) => row.legal_person_identifier,
        },
        {
          title: translate('Country'),
          render: ({ row }) => renderFieldOrDash(row.country),
        },
        {
          title: translate('Status'),
          render: ({ row }) => <StatusBadge status={row.status} />,
        },
        {
          title: translate('Validation method'),
          render: ({ row }) => row.validation_method || translate('manual'),
        },
        {
          title: translate('Customer can be created'),
          render: ({ row }) => (
            <>
              <BooleanField value={row.can_customer_be_created} />
              {row.customer_creation_error_message && (
                <Tip
                  id={`tip-customer-creation-${row.uuid}`}
                  label={row.customer_creation_error_message}
                >
                  <QuestionIcon weight="bold" />
                </Tip>
              )}
            </>
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
        {
          title: translate('Expires at'),
          render: ({ row }) =>
            row.expires_at
              ? formatDateTime(row.expires_at)
              : renderFieldOrDash(null),
        },
      ]}
      hasQuery
      rowActions={OnboardingVerificationActions}
      expandableRow={OnboardingVerificationExpandableRow}
    />
  );
};
