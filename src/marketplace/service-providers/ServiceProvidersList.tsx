import { FunctionComponent } from 'react';

import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { Table, createFetcher } from '@waldur/table';
import { useTable } from '@waldur/table/utils';

import { useMarketplacePublicTabs } from '../utils';

import { TABLE_SERVICE_PROVIDERS } from './constants';
import { ServiceProviderCard } from './ServiceProviderCard';

export const ServiceProvidersList: FunctionComponent = () => {
  useMarketplacePublicTabs();
  const props = useTable({
    table: TABLE_SERVICE_PROVIDERS,
    fetchData: createFetcher('marketplace-service-providers'),
  });

  const columns = [
    {
      title: translate('Name'),
      render: ({ row }) => row.customer_name,
    },
    {
      title: translate('Created at'),
      render: ({ row }) => formatDateTime(row.created),
    },
    {
      title: translate('Offerings'),
      render: ({ row }) => row.offering_count,
    },
  ];

  return (
    <Table
      {...props}
      columns={columns}
      gridItem={({ row }) => <ServiceProviderCard provider={row} />}
      gridSize={{ lg: 6, xl: 4 }}
      verboseName={translate('Service providers')}
      hasQuery={true}
      showPageSizeSelector={true}
      hasOptionalColumns
    />
  );
};
