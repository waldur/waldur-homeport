import { FunctionComponent, useMemo } from 'react';
import { AccessSubnet, accessSubnetsList } from 'waldur-js-client';

import { CustomerEditPanelProps } from '@/customer/details/types';
import { FilteredEventsButton } from '@/events/FilteredEventsButton';
import { translate } from '@/i18n';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';

import { AccessSubnetCreateButton } from './AccessSubnetCreateButton';
import { AccessSubnetRowActions } from './AccessSubnetRowActions';

interface CustomerAccessControlPanelProps extends CustomerEditPanelProps {
  standalone?: boolean;
}

export const CustomerAccessControlPanel: FunctionComponent<
  CustomerAccessControlPanelProps
> = ({ customer, standalone }) => {
  const customer_uuid = customer.uuid;
  const filter = useMemo(() => ({ customer_uuid }), [customer_uuid]);
  const tableProps = useTable({
    table: 'customerAccessControl',
    filter,
    fetchData: createFetcher(accessSubnetsList),
    queryField: 'description',
  });

  return (
    <Table<AccessSubnet>
      {...tableProps}
      id="access-control"
      title={translate('Access control')}
      hideTitle={standalone}
      cardBordered={!standalone}
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
      verboseName={translate('Access control')}
      hasQuery
      tableActions={
        <>
          <FilteredEventsButton
            filter={{ customer_uuid, feature: 'access_subnets' }}
          />

          <AccessSubnetCreateButton
            refetch={tableProps.fetch}
            customer_url={customer.url}
          />
        </>
      }
      rowActions={({ row }) => (
        <AccessSubnetRowActions row={row} refetch={tableProps.fetch} />
      )}
    />
  );
};
