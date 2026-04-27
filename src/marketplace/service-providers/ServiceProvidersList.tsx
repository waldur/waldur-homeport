import { FunctionComponent } from 'react';
import { marketplaceServiceProvidersList } from 'waldur-js-client';

import { formatDateTime } from '@/core/dateUtils';
import { Link } from '@/core/Link';
import { translate } from '@/i18n';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

import { useMarketplacePublicTabs } from '../utils';

import { TABLE_SERVICE_PROVIDERS } from './constants';

export const ServiceProvidersList: FunctionComponent = () => {
  useMarketplacePublicTabs();
  const props = useTable({
    table: TABLE_SERVICE_PROVIDERS,
    fetchData: createFetcher(marketplaceServiceProvidersList),
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

      copyField: (row) => row.customer_name,
      keys: ['customer_name'],
    },
    {
      title: translate('Description'),
      render: ({ row }) => renderFieldOrDash(row.description),
      keys: ['description'],
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
