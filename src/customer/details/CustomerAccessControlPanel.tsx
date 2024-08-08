import { FunctionComponent } from 'react';

import { CustomerEditPanelProps } from '@waldur/customer/details/types';
import { translate } from '@waldur/i18n';
import { Table, createFetcher } from '@waldur/table';
import { useTable } from '@waldur/table/utils';

import { AccessSubnetCreateButton } from './AccessSubnetCreateButton';
import { AccessSubnetDeleteButton } from './AccessSubnetDeleteButton';
import { AccessSubnetEditButton } from './AccessSubnetEditButton';

export const CustomerAccessControlPanel: FunctionComponent<
  CustomerEditPanelProps
> = ({ customer }) => {
  const customer_uuid = customer.uuid;
  const tableProps = useTable({
    table: 'customerAccessControl',
    fetchData: createFetcher('access-subnets', {
      params: { customer_uuid: customer_uuid },
    }),
    queryField: 'description',
  });

  return (
    <Table
      {...tableProps}
      id="access-control"
      className="card-bordered"
      title={translate('Access control')}
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
        <AccessSubnetCreateButton
          refetch={tableProps.fetch}
          customer_uuid={customer_uuid}
        />
      }
      rowActions={({ row }) => (
        <>
          <AccessSubnetEditButton row={row} refetch={tableProps.fetch} />
          <AccessSubnetDeleteButton row={row} refetch={tableProps.fetch} />
        </>
      )}
    />
  );
};
