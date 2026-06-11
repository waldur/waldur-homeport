import { useEffect } from 'react';

import { formatDateTime } from '@/core/dateUtils';
import { ExternalLink } from '@/core/ExternalLink';
import { translate } from '@/i18n';
import { createClientPaginatedFetcher } from '@/table/api';
import { DASH_ESCAPE_CODE } from '@/table/constants';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';

export const CallDocumentsCard = ({ call, rowActions, tableActions }) => {
  const tableProps = useTable({
    table: 'CallDocumentsCard',
    fetchData: createClientPaginatedFetcher(call.documents),
  });

  useEffect(() => {
    tableProps.fetch();
  }, [call.documents]);

  const columns = [
    {
      title: translate('File name'),
      render: ({ row }) => (
        <ExternalLink
          url={row.file}
          label={decodeURIComponent(
            row.file_name
              .split('/')
              .pop()
              .replace(/_[^_]+\./, '.'),
          )}
          iconless
        />
      ),
    },
    {
      title: translate('Description'),
      render: ({ row }) => row.description || DASH_ESCAPE_CODE,
    },
    {
      title: translate('Uploaded at'),
      render: ({ row }) => formatDateTime(row.created),
    },
  ];

  return (
    <Table
      {...tableProps}
      columns={columns}
      title={translate('Documents')}
      verboseName={translate('Documents')}
      tableActions={tableActions}
      rowActions={rowActions}
    />
  );
};
