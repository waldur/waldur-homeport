import { useModal } from 'waldur-ui';

import { lazyComponent } from '@/core/lazyComponent';

import { ExportFormat } from './exporters/types';
import { TableProps } from './types';

const ExportDialog = lazyComponent(() =>
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
