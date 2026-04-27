import { FC } from 'react';
import {
  ServiceProvider,
  serviceProviderOfferingUsersCompliance,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { TableWithPortal } from '@/table/types';
import { useTable } from '@/table/useTable';

import { MetadataByOfferingExpandableRow } from './MetadataByOfferingExpandableRow';

export const OfferingsMetadataByOffering: FC<
  TableWithPortal & { provider: ServiceProvider }
> = ({ portal, provider }) => {
  // FIX THIS: api endpoint is wrong
  const tableProps = useTable({
    table: 'OfferingsMetadataByOffering-' + provider.uuid,
    fetchData: createFetcher(serviceProviderOfferingUsersCompliance, {
      path: { service_provider_uuid: provider.uuid },
    }),
  });

  return (
    <Table
      {...tableProps}
      columns={[
        {
          title: translate('Offering name'),
          render: ({ row }) => row.offering_name,
          orderField: 'offering_name',
        },
      ]}
      verboseName={translate('Offerings')}
      portal={portal}
      hasActionBar={false}
      cardBordered={false}
      fullWidth
      hasQuery
      // tableActions={}
      expandableRow={MetadataByOfferingExpandableRow}
    />
  );
};
