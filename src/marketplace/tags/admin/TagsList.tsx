import { FunctionComponent } from 'react';
import { marketplaceTagsList, Tag } from 'waldur-js-client';

import { formatDateTime } from '@/core/dateUtils';
import { truncate } from '@/core/utils';
import { translate } from '@/i18n';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';

import { TagCreateButton } from './TagCreateButton';
import { TagExpandableRow } from './TagExpandableRow';
import { TagsBulkDeleteAction } from './TagsBulkDeleteAction';
import { TagsRowActions } from './TagsRowActions';

export const TagsList: FunctionComponent = () => {
  const tableProps = useTable({
    table: 'TagsList',
    fetchData: createFetcher(marketplaceTagsList),
    queryField: 'name',
  });

  return (
    <Table<Tag>
      {...tableProps}
      columns={[
        {
          title: translate('Name'),
          render: ({ row }) => row.name,
          copyField: (row) => row.name,
        },
        {
          title: translate('UUID'),
          render: ({ row }) => row.uuid,
          copyField: (row) => row.uuid,
        },
        {
          title: translate('Description'),
          render: ({ row }) => <>{truncate(row.description, 80)}</>,
        },
        {
          title: translate('Offerings'),
          render: ({ row }) => row.offering_count,
        },
        {
          title: translate('Created'),
          render: ({ row }) => (
            <>
              {formatDateTime(row.created)}
              {row.created_by_full_name && (
                <span className="text-muted ms-2">
                  {translate('by {name}', { name: row.created_by_full_name })}
                </span>
              )}
            </>
          ),
        },
      ]}
      verboseName={translate('Tags')}
      initialSorting={{ field: 'name', mode: 'asc' }}
      rowActions={({ row }) => (
        <TagsRowActions row={row} refetch={tableProps.fetch} />
      )}
      hasQuery={true}
      tableActions={<TagCreateButton refetch={tableProps.fetch} />}
      enableMultiSelect
      multiSelectActions={TagsBulkDeleteAction}
      expandableRow={TagExpandableRow}
    />
  );
};
