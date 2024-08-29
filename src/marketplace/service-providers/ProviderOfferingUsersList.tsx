import { FunctionComponent, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';

import { formatDateTime } from '@waldur/core/dateUtils';
import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { createFetcher, Table } from '@waldur/table';
import { useTable } from '@waldur/table/utils';

import { OfferingUserRowActions } from '../offerings/actions/OfferingUserRowActions';
import { CustomerResourcesListPlaceholder } from '../resources/list/CustomerResourcesListPlaceholder';

import { PROVIDER_OFFERING_USERS_FORM_ID } from './constants';
import { CreateProviderOfferingUserButton } from './CreateProviderOfferingUserButton';
import { ProviderOfferingUsersFilter } from './ProviderOfferingUsersFilter';

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
    },
    ...organizationColumn,
    {
      title: translate('User'),
      render: ({ row }) => row.user_full_name,
    },
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
    {
      title: translate('Propagated'),
      render: ({ row }) =>
        row.propagation_date ? formatDateTime(row.propagation_date) : 'N/A',
      orderField: 'propagation_date',
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
        <CreateProviderOfferingUserButton refetch={tableProps.fetch} />
      }
      rowActions={({ row }) => (
        <OfferingUserRowActions
          row={row}
          fetch={tableProps.fetch}
          provider={provider}
        />
      )}
      hasQuery={true}
    />
  );
};

export const ProviderOfferingUsersList = ({ provider }) => {
  if (!provider) {
    return <CustomerResourcesListPlaceholder />;
  }
  return <ProviderOfferingUsersListComponent provider={provider} />;
};
