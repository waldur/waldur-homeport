import { FunctionComponent } from 'react';
import { marketplaceCategoryGroupsList } from 'waldur-js-client';

import Avatar from '@/core/Avatar';
import { Link } from '@/core/Link';
import { truncate } from '@/core/utils';
import { translate } from '@/i18n';
import { CategoryGroup } from '@/marketplace/types';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';

import { CategoryGroupsRowActions } from './CategoryGroupsRowActions';
import { GroupCreateButton } from './GroupCreateButton';

export const CategoryGroupsList: FunctionComponent = () => {
  const tableProps = useTable({
    table: 'CategoryGroupsList',
    fetchData: createFetcher(marketplaceCategoryGroupsList),
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
