import { useSelector } from 'react-redux';

import { translate } from '@waldur/i18n';
import { Table, createFetcher } from '@waldur/table';
import { useTable } from '@waldur/table/utils';
import { getCustomer } from '@waldur/workspace/selectors';

import { AccessSubnetCreateButton } from './AccessSubnetCreateButton';
import { AccessSubnetDeleteButton } from './AccessSubnetDeleteButton';
import { AccessSubnetEditButton } from './AccessSubnetEditButton';

export const CustomerAccessControlPanel = () => {
  const customer = useSelector(getCustomer);

  const tableProps = useTable({
    table: 'customerAccessControl',
    fetchData: createFetcher('access-subnets', {
      params: { customer_uuid: customer.uuid },
    }),
    queryField: 'description',
  });

  return (
    <Table
      {...tableProps}
      id="access-control"
      className="mt-5"
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
      actions={
        <AccessSubnetCreateButton
          refetch={tableProps.fetch}
          customer_uuid={customer.uuid}
        />
      }
      hoverableRow={({ row }) => (
        <>
          <AccessSubnetEditButton row={row} refetch={tableProps.fetch} />
          <AccessSubnetDeleteButton row={row} refetch={tableProps.fetch} />
        </>
      )}
    />
  );
};
