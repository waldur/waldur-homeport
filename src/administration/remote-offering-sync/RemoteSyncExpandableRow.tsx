import { FC, useEffect } from 'react';
import {
  NestedRemoteLocalCategory,
  RemoteSynchronisation,
} from 'waldur-js-client';

import { CopyToClipboardButton } from '@/core/CopyToClipboardButton';
import { translate } from '@/i18n';
import { createClientPaginatedFetcher } from '@/table/api';
import { ExpandableContainer } from '@/table/ExpandableContainer';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';

const FieldWithCopy = ({ value }) => {
  return (
    <>
      {value}
      <CopyToClipboardButton value={value} className="ms-2 d-inline-block" />
    </>
  );
};

export const RemoteSyncExpandableRow: FC<{
  row: RemoteSynchronisation;
}> = ({ row: remoteSync }) => {
  const tableProps = useTable({
    table: 'RemoteSyncCategoryRules-' + remoteSync.uuid,
    fetchData: createClientPaginatedFetcher(remoteSync.remotelocalcategory_set),
  });

  useEffect(() => {
    tableProps.fetch();
  }, [remoteSync.remotelocalcategory_set]);

  return (
    <ExpandableContainer>
      <Table<NestedRemoteLocalCategory>
        {...tableProps}
        columns={[
          {
            title: translate('Remote category name'),
            render: ({ row }) => (
              <span className="text-dark">
                <FieldWithCopy value={row.remote_category_name} />
              </span>
            ),
          },
          {
            title: translate('Local category name'),
            render: ({ row }) => (
              <FieldWithCopy value={row.local_category_name} />
            ),
          },
          {
            title: translate('Remote category UUID'),
            render: ({ row }) => <FieldWithCopy value={row.remote_category} />,
          },
          {
            title: translate('Local category UUID'),
            render: ({ row }) => (
              <FieldWithCopy value={row.local_category_uuid} />
            ),
          },
        ]}
        verboseName={translate('Category rules')}
        initialSorting={{ field: 'remote_category', mode: 'desc' }}
        placeholderComponent={
          <div>
            <p className="text-muted text-center">
              {translate('No items found')}
            </p>
          </div>
        }
        hasActionBar={false}
        minHeight="auto"
      />
    </ExpandableContainer>
  );
};
