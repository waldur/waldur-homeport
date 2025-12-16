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

export const getOnboardingVerificationColumns = (options?: {
  hideCustomerCreationColumn?: boolean;
}): any[] => {
  const columns: any[] = [
    {
      title: translate('Legal name'),
      render: ({ row }) => renderFieldOrDash(row.legal_name),
      copyField: (row) => row.legal_name,
      id: 'legal_name',
      keys: ['legal_name'],
    },
    {
      title: translate('Registration code'),
      render: ({ row }) => renderFieldOrDash(row.legal_person_identifier),
      copyField: (row) => row.legal_person_identifier,
      id: 'legal_person_identifier',
      keys: ['legal_person_identifier'],
    },
    {
      title: translate('Country'),
      render: ({ row }) => renderFieldOrDash(row.country),
      id: 'country',
      keys: ['country'],
    },
    {
      title: translate('Status'),
      render: ({ row }) => <StatusBadge status={row.status} />,
      id: 'status',
      keys: ['status'],
    },
    {
      title: translate('Validation method'),
      render: ({ row }) => row.validation_method || translate('manual'),
      id: 'validation_method',
      keys: ['validation_method'],
    },
  ];

  if (!options?.hideCustomerCreationColumn) {
    columns.push({
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
      id: 'can_customer_be_created',
      keys: ['can_customer_be_created'],
    });
  }

  columns.push(
    {
      title: translate('Created'),
      render: ({ row }) => formatDateTime(row.created),
      optional: true,
      id: 'created',
      keys: ['created'] as Array<keyof OnboardingVerification>,
    },
    {
      title: translate('Validated at'),
      render: ({ row }) =>
        row.validated_at
          ? formatDateTime(row.validated_at)
          : renderFieldOrDash(null),
      optional: true,
      id: 'validated_at',
      keys: ['validated_at'] as Array<keyof OnboardingVerification>,
    },
    {
      title: translate('Expires at'),
      render: ({ row }) =>
        row.expires_at
          ? formatDateTime(row.expires_at)
          : renderFieldOrDash(null),
      optional: true,
      id: 'expires_at',
      keys: ['expires_at'] as Array<keyof OnboardingVerification>,
    },
  );

  return columns;
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
      columns={getOnboardingVerificationColumns()}
      hasQuery
      rowActions={OnboardingVerificationActions}
      expandableRow={OnboardingVerificationExpandableRow}
      hasOptionalColumns
    />
  );
};
