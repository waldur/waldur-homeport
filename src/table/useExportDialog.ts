import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { openModalDialog } from '@waldur/modal/actions';

import { ExportFormat } from './exporters/types';
import { TableState } from './types';

const ExportDialog = lazyComponent(() =>
  import('./ExportDialog').then((module) => ({ default: module.ExportDialog })),
);

export const useExportDialog = () => {
  const dispatch = useDispatch();
  return (
    table: string,
    format: ExportFormat,
    ownProps?: Partial<TableState>,
  ) => {
    dispatch(
      openModalDialog(ExportDialog, {
        resolve: {
          table,
          format,
          ownProps,
        },
      }),
    );
  };
};
