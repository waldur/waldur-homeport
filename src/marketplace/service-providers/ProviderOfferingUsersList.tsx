import { FunctionComponent, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { OfferingUserStateEnum } from 'waldur-js-client';

import { Badge } from '@waldur/core/Badge';
import { formatDateTime } from '@waldur/core/dateUtils';
import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';

import { OfferingUserRowActions } from '../offerings/actions/OfferingUserRowActions';
import { UserImportButton } from '../offerings/import-users/UserImportButton';
import { CustomerResourcesListPlaceholder } from '../resources/list/CustomerResourcesListPlaceholder';

import { PROVIDER_OFFERING_USERS_FORM_ID } from './constants';
import { CreateProviderOfferingUserButton } from './CreateProviderOfferingUserButton';
import { OfferingUsersExpandableRow } from './OfferingUsersExpandableRow';
import { ProviderOfferingUsersFilter } from './ProviderOfferingUsersFilter';

const getStateColor = (state: OfferingUserStateEnum) => {
  switch (state) {
    case 'OK':
      return 'success';
    case 'Creating':
      return 'blue';
    case 'Pending account linking':
    case 'Pending additional validation':
      return 'warning';
    case 'Error creating':
    case 'Error deleting':
      return 'danger';
    case 'Deleted':
    case 'Deleting':
      return 'pink';
    case 'Requested':
    case 'Requested deletion':
      return 'default';
  }
};

const AccountStateField = ({ row }) => (
  <Badge variant={getStateColor(row.state)} pill outline>
    {row.state}
  </Badge>
);

export const ProviderOfferingUsersListComponent: FunctionComponent<{
  provider?;
  hasOrganizationColumn?: boolean;
}> = ({ provider, hasOrganizationColumn }) => {
  const filterValues = useSelector(
    getFormValues(PROVIDER_OFFERING_USERS_FORM_ID),
  ) as { offering?; provider? };
  const filter = useMemo(
    () => ({
      provider_uuid: hasOrganizationColumn
        ? filterValues?.provider?.customer_uuid
        : provider?.customer_uuid,
      offering_uuid: filterValues?.offering?.uuid,
    }),
    [provider, filterValues],
  );
  const tableProps = useTable({
    table: 'marketplace-offering-users',
    fetchData: createFetcher(`marketplace-offering-users`),
    filter,
    queryField: 'query',
  });
  const organizationColumn = hasOrganizationColumn
    ? [
        {
          title: translate('Organization'),
          render: ({ row }) => row.customer_name,
          filter: 'provider',
          inlineFilter: (row) => ({
            customer_name: row.customer_name,
            customer_uuid: row.customer_uuid,
          }),
        },
      ]
    : [];
  const stateColumn = provider
    ? [
        {
          title: translate('Account state'),
          render: AccountStateField,
        },
      ]
    : [];
  const columns = [
    {
      title: translate('Offering'),
      render: ({ row }) => (
        <Link
          state="public-offering.marketplace-public-offering"
          params={{ uuid: row.offering_uuid }}
          label={row.offering_name}
        />
      ),

      filter: 'offering',
      inlineFilter: (row) => ({
        name: row.offering_name,
        uuid: row.offering_uuid,
      }),
    },
    ...organizationColumn,
    {
      title: translate('User'),
      render: ({ row }) => row.user_full_name,
    },
    ...stateColumn,
    {
      title: translate('External username'),
      render: ({ row }) => row.username || 'N/A',
      orderField: 'username',
    },
    {
      title: translate('Created'),
      render: ({ row }) => formatDateTime(row.created),
      orderField: 'created',
    },
    {
      title: translate('Modified'),
      render: ({ row }) => formatDateTime(row.modified),
      orderField: 'modified',
    },
  ];

  return (
    <Table
      {...tableProps}
      columns={columns}
      verboseName={translate('Offering users')}
      showPageSizeSelector={true}
      filters={
        <ProviderOfferingUsersFilter
          hasOrganizationColumn={hasOrganizationColumn}
        />
      }
      tableActions={
        <>
          <UserImportButton refetch={tableProps.fetch} provider={provider} />
          <CreateProviderOfferingUserButton
            refetch={tableProps.fetch}
            provider={provider}
          />
        </>
      }
      rowActions={({ row }) => (
        <OfferingUserRowActions
          row={row}
          fetch={tableProps.fetch}
          provider={provider}
        />
      )}
      hasQuery={true}
      expandableRow={provider ? OfferingUsersExpandableRow : undefined}
    />
  );
};

export const ProviderOfferingUsersList = ({ provider }) => {
  if (!provider) {
    return <CustomerResourcesListPlaceholder />;
  }
  return <ProviderOfferingUsersListComponent provider={provider} />;
};
