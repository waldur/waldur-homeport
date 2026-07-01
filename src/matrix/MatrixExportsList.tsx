import { FC, useMemo } from 'react';
import { MatrixHistoryExport, matrixExportsList } from 'waldur-js-client';

import { formatDateTime } from '@/core/dateUtils';
import { FileDownloader } from '@/form/upload/FileDownloader';
import { translate } from '@/i18n';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { Column, TableProps } from '@/table/types';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

import { MatrixExportStateBadge } from './MatrixExportStateBadge';

const exportTypeLabel = (type: string) => {
  switch (type) {
    case 'periodic':
      return translate('Periodic');
    case 'on_deletion':
      return translate('On deletion');
    case 'manual':
      return translate('Manual');
    default:
      return type;
  }
};

// The export writes media into a separate ZIP archive (media_file_url),
// distinct from the JSON message log (export_file_url). Surface its download
// next to the count so the archive is reachable from the table at all.
const ExportMediaFilesCell: FC<{ row: MatrixHistoryExport }> = ({ row }) => (
  <div className="d-flex align-items-center gap-2">
    <span>{row.media_count}</span>
    {row.media_file_url && (
      <FileDownloader
        url={row.media_file_url}
        name={`matrix-media-${row.room_name || row.room_uuid}.zip`}
      />
    )}
  </div>
);

interface MatrixExportsListProps {
  room_uuid?: string;
  hasActionBar?: boolean;
  portal?: TableProps['portal'];
}

export const MatrixExportsList: FC<MatrixExportsListProps> = ({
  room_uuid,
  hasActionBar = true,
  portal,
}) => {
  const filter = useMemo(() => (room_uuid ? { room_uuid } : {}), [room_uuid]);

  const tableProps = useTable({
    table: `matrix-exports-${room_uuid || 'all'}`,
    fetchData: createFetcher(matrixExportsList),
    filter,
  });

  const columns: Column<MatrixHistoryExport>[] = useMemo(
    () =>
      [
        !room_uuid && {
          title: translate('Room'),
          render: ({ row }) => renderFieldOrDash(row.room_name),
          id: 'room_name',
        },
        {
          title: translate('Type'),
          render: ({ row }) => exportTypeLabel(row.export_type),
          id: 'export_type',
        },
        {
          title: translate('State'),
          render: ({ row }) => (
            <MatrixExportStateBadge
              state={row.state}
              errorMessage={row.error_message}
            />
          ),
          id: 'state',
        },
        {
          title: translate('Messages'),
          render: ({ row }) => <>{row.message_count}</>,
          id: 'message_count',
        },
        {
          title: translate('Media files'),
          render: ({ row }) => <ExportMediaFilesCell row={row} />,
          id: 'media_count',
        },
        {
          title: translate('Started'),
          render: ({ row }) =>
            renderFieldOrDash(formatDateTime(row.started_at)),
          id: 'started_at',
        },
        {
          title: translate('Completed'),
          render: ({ row }) =>
            renderFieldOrDash(formatDateTime(row.completed_at)),
          id: 'completed_at',
        },
        {
          title: translate('Log'),
          render: ({ row }) =>
            row.export_file_url ? (
              <FileDownloader
                url={row.export_file_url}
                name={`matrix-export-${row.room_name || row.room_uuid}.json`}
              />
            ) : (
              renderFieldOrDash(null)
            ),
          id: 'export_file_url',
        },
      ].filter(Boolean),
    [room_uuid],
  );

  return (
    <Table<MatrixHistoryExport>
      {...tableProps}
      columns={columns}
      verboseName={translate('history exports')}
      hideTitle
      hasActionBar={hasActionBar}
      portal={portal}
    />
  );
};
