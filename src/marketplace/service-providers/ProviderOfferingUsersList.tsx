import { useMemo } from 'react';

import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { createFetcher, Table } from '@waldur/table';
import { useTable } from '@waldur/table/utils';

import { CustomerResourcesListPlaceholder } from '../resources/list/CustomerResourcesListPlaceholder';

export const ProviderOfferingUsersListComponent = ({ provider }) => {
  const filter = useMemo(
    () => ({
      provider_uuid: provider.customer_uuid,
    }),
    [provider],
  );
  const tableProps = useTable({
    table: 'marketplace-offering-users',
    fetchData: createFetcher(`marketplace-offering-users`),
    filter,
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
    },
    {
      title: translate('Created'),
      render: ({ row }) => formatDateTime(row.created),
    },
    {
      title: translate('Modified'),
      render: ({ row }) => formatDateTime(row.modified),
    },
    {
      title: translate('Propagated'),
      render: ({ row }) => formatDateTime(row.propagation_date),
    },
  ];
  return (
    <Table
      {...tableProps}
      columns={columns}
      verboseName={translate('Offering users')}
      showPageSizeSelector={true}
    />
  );
};

export const ProviderOfferingUsersList = ({ provider }) => {
  if (!provider) {
    return <CustomerResourcesListPlaceholder />;
  }
  return <ProviderOfferingUsersListComponent provider={provider} />;
};
