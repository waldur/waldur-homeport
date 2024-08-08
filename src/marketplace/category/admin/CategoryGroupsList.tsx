import { FunctionComponent } from 'react';

import { Image } from '@waldur/core/Image';
import { ImagePlaceholder } from '@waldur/core/ImagePlaceholder';
import { Link } from '@waldur/core/Link';
import { truncate } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { CategoryGroup } from '@waldur/marketplace/types';
import { Table, createFetcher } from '@waldur/table';
import { useTable } from '@waldur/table/utils';

import { GroupCreateButton } from './GroupCreateButton';
import { GroupDeleteButton } from './GroupDeleteButton';
import { GroupEditButton } from './GroupEditButton';

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
                {row.icon ? (
                  <Image src={row.icon} size={30} isContain />
                ) : (
                  <ImagePlaceholder width="30px" height="30px" />
                )}
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
        <>
          <GroupEditButton row={row} refetch={tableProps.fetch} />
          <GroupDeleteButton row={row} refetch={tableProps.fetch} />
        </>
      )}
      hasQuery={true}
      tableActions={<GroupCreateButton refetch={tableProps.fetch} />}
    />
  );
};
