import { FunctionComponent, useMemo } from 'react';
import {
  Offering,
  OfferingAccessSubnet,
  marketplaceOfferingAccessSubnetsList,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { TableTab } from '@/table/types';
import { useTable } from '@/table/useTable';
import { useUser } from '@/workspace/hooks';

import { OfferingAccessSubnetCreateButton } from './OfferingAccessSubnetCreateButton';
import { OfferingAccessSubnetRowActions } from './OfferingAccessSubnetRowActions';
import { OfferingAccessSubnetsAllowListButton } from './OfferingAccessSubnetsAllowListButton';

interface OfferingDefaultSubnetsTableProps {
  offering: Offering;
  tabs: TableTab[];
}

export const OfferingDefaultSubnetsTable: FunctionComponent<
  OfferingDefaultSubnetsTableProps
> = ({ offering, tabs }) => {
  const offering_uuid = offering.uuid;
  const filter = useMemo(() => ({ offering_uuid }), [offering_uuid]);
  const tableProps = useTable({
    table: 'offeringDefaultAccessSubnets',
    filter,
    fetchData: createFetcher(marketplaceOfferingAccessSubnetsList),
    queryField: 'description',
  });

  const user = useUser();
  const canManage = hasPermission(user, {
    permission: PermissionEnum.CREATE_OFFERING_ACCESS_SUBNET,
    customerId: offering.customer_uuid,
  });

  return (
    <Table<OfferingAccessSubnet>
      {...tableProps}
      id="offering-default-access-subnets"
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
      ]}
      verboseName={translate('default access subnets')}
      hasQuery
      tableActions={
        <>
          <OfferingAccessSubnetsAllowListButton offeringUuid={offering.uuid} />
          {canManage && (
            <OfferingAccessSubnetCreateButton
              refetch={tableProps.fetch}
              offering_url={offering.url}
            />
          )}
        </>
      }
      rowActions={
        canManage
          ? ({ row }) => (
              <OfferingAccessSubnetRowActions
                row={row}
                refetch={tableProps.fetch}
              />
            )
          : undefined
      }
    />
  );
};
