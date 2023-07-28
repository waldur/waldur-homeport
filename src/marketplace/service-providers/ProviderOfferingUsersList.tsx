import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';

import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { createFetcher, Table } from '@waldur/table';
import { useTable } from '@waldur/table/utils';

import { CustomerResourcesListPlaceholder } from '../resources/list/CustomerResourcesListPlaceholder';

import { PROVIDER_OFFERING_USERS_FORM_ID } from './constants';
import { ProviderOfferingUsersFilter } from './ProviderOfferingUsersFilter';
import { ProviderOfferingUserUpdateButton } from './ProviderOfferingUserUpdateButton';

export const ProviderOfferingUsersListComponent = ({ provider }) => {
  const filterValues = useSelector(
    getFormValues(PROVIDER_OFFERING_USERS_FORM_ID),
  ) as { offering? };
  const filter = useMemo(
    () => ({
      provider_uuid: provider.customer_uuid,
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
  const columns = [
    {
      title: translate('Offering'),
      render: ({ row }) => row.offering_name,
    },
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
      filters={<ProviderOfferingUsersFilter />}
      hoverableRow={({ row }) => (
        <ProviderOfferingUserUpdateButton
          row={row}
          provider={provider}
          refetch={tableProps.fetch}
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
