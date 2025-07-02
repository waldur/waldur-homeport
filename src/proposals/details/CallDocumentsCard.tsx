import { useEffect } from 'react';

import { formatDateTime } from '@waldur/core/dateUtils';
import { ExternalLink } from '@waldur/core/ExternalLink';
import { translate } from '@waldur/i18n';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';

export const CallDocumentsCard = ({ call, rowActions, tableActions }) => {
  const tableProps = useTable({
    table: 'CallDocumentsCard',
    fetchData: () =>
      Promise.resolve({
        rows: call.documents,
        resultCount: call.documents.length,
      }),
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
