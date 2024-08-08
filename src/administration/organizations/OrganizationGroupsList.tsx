import { FunctionComponent } from 'react';

import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { OrganizationGroup } from '@waldur/marketplace/types';
import { createFetcher, Table } from '@waldur/table';
import { useTable } from '@waldur/table/utils';

import { OrganizationGroupCreateButton } from './OrganizationGroupCreateButton';
import { OrganizationGroupDeleteButton } from './OrganizationGroupDeleteButton';
import { OrganizationGroupDetailsButton } from './OrganizationGroupDetailsButton';
import { OrganizationGroupEditButton } from './OrganizationGroupEditButton';

export const OrganizationGroupsList: FunctionComponent = () => {
  const tableProps = useTable({
    table: 'OrganizationGroupsList',
    fetchData: createFetcher('organization-groups'),
    queryField: 'name',
  });

  return (
    <Table<OrganizationGroup>
      {...tableProps}
      columns={[
        {
          title: translate('Type'),
          render: ({ row }) => (
            <Link
              state="admin-organization-group-types-list"
              params={{ group: row.uuid }}
            >
              {row.type_name}
            </Link>
          ),
        },
        {
          title: translate('Name'),
          render: ({ row }) => <>{row.name}</>,
          orderField: 'name',
        },
        {
          title: translate('Organisations'),
          render: ({ row }) => <>{row.customers_count}</>,
          orderField: 'customers_count',
        },
      ]}
      verboseName={translate('Organization groups')}
      rowActions={({ row }) => (
        <>
          <OrganizationGroupDetailsButton organizationGroup={row} />
          <OrganizationGroupEditButton row={row} refetch={tableProps.fetch} />
          <OrganizationGroupDeleteButton row={row} refetch={tableProps.fetch} />
        </>
      )}
      tableActions={
        <OrganizationGroupCreateButton refetch={tableProps.fetch} />
      }
      initialSorting={{ field: 'name', mode: 'desc' }}
      hasQuery={true}
    />
  );
};
