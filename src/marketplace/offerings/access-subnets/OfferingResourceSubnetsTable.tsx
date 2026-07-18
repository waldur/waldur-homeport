import { FunctionComponent, useMemo } from 'react';
import {
  Offering,
  ResourceAccessSubnet,
  marketplaceResourceAccessSubnetsList,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { TableTab } from '@/table/types';
import { useTable } from '@/table/useTable';

import { OfferingAccessSubnetsAllowListButton } from './OfferingAccessSubnetsAllowListButton';

interface OfferingResourceSubnetsTableProps {
  offering: Offering;
  tabs: TableTab[];
}

export const OfferingResourceSubnetsTable: FunctionComponent<
  OfferingResourceSubnetsTableProps
> = ({ offering, tabs }) => {
  const offering_uuid = offering.uuid;
  const filter = useMemo(() => ({ offering_uuid }), [offering_uuid]);
  const tableProps = useTable({
    table: 'offeringResourceAccessSubnets',
    filter,
    fetchData: createFetcher(marketplaceResourceAccessSubnetsList),
    queryField: 'description',
  });

  return (
    <Table<ResourceAccessSubnet>
      {...tableProps}
      id="offering-resource-access-subnets"
      title={translate('Access subnets')}
      tabs={tabs}
      columns={[
        {
          title: translate('CIDR'),
          render: ({ row }) => <>{row.inet}</>,
        },
        {
          title: translate('Description'),
          render: ({ row }) => <>{row.description}</>,
        },
        {
          title: translate('Resource'),
          render: ({ row }) => <>{row.resource_name}</>,
        },
      ]}
      verboseName={translate('resource access subnets')}
      hasQuery
      tableActions={
        <OfferingAccessSubnetsAllowListButton offeringUuid={offering.uuid} />
      }
    />
  );
};
