import { lazyComponent } from '@/core/lazyComponent';
import { useModal } from '@/modal/actions';

import { ExportFormat } from './exporters/types';
import { TableProps } from './types';

const ExportDialog = lazyComponent(() =>
  import('./ExportDialog').then((module) => ({ default: module.ExportDialog })),
);

export const useExportDialog = () => {
  const { openDialog } = useModal();
  return (
    table: string,
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
