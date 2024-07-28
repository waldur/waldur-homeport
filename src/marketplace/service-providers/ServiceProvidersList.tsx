import { FunctionComponent } from 'react';

import { formatDateTime } from '@waldur/core/dateUtils';
import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { Table, createFetcher } from '@waldur/table';
import { useTable } from '@waldur/table/utils';

import { useMarketplacePublicTabs } from '../utils';

import { TABLE_SERVICE_PROVIDERS } from './constants';

export const ServiceProvidersList: FunctionComponent = () => {
  useMarketplacePublicTabs();
  const props = useTable({
    table: TABLE_SERVICE_PROVIDERS,
    fetchData: createFetcher('marketplace-service-providers'),
  });

  const columns = [
    {
      title: translate('Name'),
      render: ({ row }) => (
        <Link
          state="marketplace-providers.details"
          params={{ customer_uuid: row.customer_uuid }}
          label={row.customer_name}
        />
      ),
      keys: ['customer_name'],
    },
    {
      title: translate('Created at'),
      render: ({ row }) => formatDateTime(row.created),
      keys: ['created'],
    },
    {
      title: translate('Offerings'),
      render: ({ row }) => row.offering_count,
      keys: ['offering_count'],
    },
  ];

  return (
    <Table
      {...props}
      columns={columns}
      verboseName={translate('Service providers')}
      hasQuery={true}
      showPageSizeSelector={true}
      standalone
    />
  );
};
