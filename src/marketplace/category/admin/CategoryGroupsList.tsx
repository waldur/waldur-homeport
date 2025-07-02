import { FunctionComponent } from 'react';

import Avatar from '@waldur/core/Avatar';
import { Link } from '@waldur/core/Link';
import { truncate } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { CategoryGroup } from '@waldur/marketplace/types';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';

import { CategoryGroupsRowActions } from './CategoryGroupsRowActions';
import { GroupCreateButton } from './GroupCreateButton';

export const CategoryGroupsList: FunctionComponent = () => {
  const tableProps = useTable({
    table: 'CategoryGroupsList',
    fetchData: createFetcher('marketplace-category-groups'),
    queryField: 'title',
  });

  return (
    <Table<CategoryGroup>
      {...tableProps}
      columns={[
        {
          title: translate('Title'),
          render: ({ row }) => (
            <>
              <div className="d-inline-block align-middle me-2">
                <Avatar name={row.title} src={row.icon} circle />
              </div>
              <Link
                state="admin-marketplace-categories"
                params={{ group: row.uuid }}
              >
                {row.title}
              </Link>
            </>
          ),
        },
        {
          title: translate('Description'),
          render: ({ row }) => <>{truncate(row.description, 80)}</>,
        },
      ]}
      verboseName={translate('Category groups')}
      initialSorting={{ field: 'title', mode: 'desc' }}
      rowActions={({ row }) => (
        <CategoryGroupsRowActions row={row} refetch={tableProps.fetch} />
      )}
      hasQuery={true}
      tableActions={<GroupCreateButton refetch={tableProps.fetch} />}
    />
  );
};
