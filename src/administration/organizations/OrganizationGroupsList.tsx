import { FunctionComponent } from 'react';
import { OrganizationGroup, organizationGroupsList } from 'waldur-js-client';

import { translate } from '@/i18n';
import { createFetcher } from '@/table/api';
import { DASH_ESCAPE_CODE } from '@/table/constants';
import Table from '@/table/Table';
import { TableWithPortal } from '@/table/types';
import { useTable } from '@/table/useTable';

import { tabTableProps } from '../tabTableProps';

import { OrganizationGroupCreateButton } from './OrganizationGroupCreateButton';
import { OrganizationGroupRowActions } from './OrganizationGroupRowActions';

export const OrganizationGroupsList: FunctionComponent<
  Partial<TableWithPortal>
> = ({ portal }) => {
  const tableProps = useTable({
    table: 'OrganizationGroupsList',
    fetchData: createFetcher(organizationGroupsList),
    queryField: 'name',
  });

  return (
    <Table<OrganizationGroup>
      {...tableProps}
      {...tabTableProps(portal)}
      columns={[
        {
          title: translate('Name'),
          render: ({ row }) => <>{row.name}</>,
          orderField: 'name',
          copyField: (row) => row.name,
        },
        {
          title: translate('Parent group'),
          render: ({ row }) => row.parent_name || DASH_ESCAPE_CODE,
        },
        {
          title: translate('Organisations'),
          render: ({ row }) => <>{row.customers_count}</>,
          orderField: 'customers_count',
        },
      ]}
      verboseName={translate('Organization groups')}
      rowActions={OrganizationGroupRowActions}
      tableActions={
        <OrganizationGroupCreateButton refetch={tableProps.fetch} />
      }
      initialSorting={{ field: 'name', mode: 'desc' }}
      hasQuery={true}
    />
  );
};
