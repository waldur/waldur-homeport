import { useModal } from 'waldur-ui';

import { ExportFormat } from './exporters/types';
import { lazyTableDialog } from './host';
import { TableProps } from './types';

const ExportDialog = lazyTableDialog(() =>
  import('./ExportDialog').then((module) => ({ default: module.ExportDialog })),
);

export const useExportDialog = () => {
  const { openDialog } = useModal();
  // `table` is left out to offer only `ownProps.fullExport`.
  return (
    table: string | undefined,
    format: ExportFormat,
    ownProps?: Partial<TableProps>,
  ) => {
    openDialog(ExportDialog, {
      resolve: {
        table,
        format,
        ownProps,
      },
    });
  };
};
