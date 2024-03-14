import { FunctionComponent } from 'react';

import { Link } from '@waldur/core/Link';
import { OrganizationGroupEditButton } from '@waldur/customer/list/CategoryGroupEditButton';
import { OrganizationGroupCreateButton } from '@waldur/customer/list/OrganizationGroupCreateButton';
import { OrganizationGroupDeleteButton } from '@waldur/customer/list/OrganizationGroupDeleteButton';
import { OrganizationGroupDetailsButton } from '@waldur/customer/list/OrganizationGroupDetailsButton';
import { translate } from '@waldur/i18n';
import { OrganizationGroup } from '@waldur/marketplace/types';
import { createFetcher, Table } from '@waldur/table';
import { useTable } from '@waldur/table/utils';

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
            <>
              <Link
                state="admin-organization-group-types-list"
                params={{ group: row.uuid }}
              >
                {row.type_name}
              </Link>
            </>
          ),
        },
        {
          title: translate('Name'),
          render: ({ row }) => <>{row.name}</>,
        },
      ]}
      verboseName={translate('Organization groups')}
      hoverableRow={({ row }) => (
        <>
          <OrganizationGroupDetailsButton organizationGroup={row} />
          <OrganizationGroupEditButton row={row} refetch={tableProps.fetch} />
          <OrganizationGroupDeleteButton row={row} refetch={tableProps.fetch} />
        </>
      )}
      actions={<OrganizationGroupCreateButton refetch={tableProps.fetch} />}
      initialSorting={{ field: 'name', mode: 'desc' }}
      hasQuery={true}
    />
  );
};
