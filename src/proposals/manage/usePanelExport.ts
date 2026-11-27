import { useCallback } from 'react';

import { downloadFile } from '@/form/upload/FileDownloader';
import { translate } from '@/i18n';
import { useNotify } from '@/store/notify';

import { Call } from '../types';

import {
  buildPanelExportUrl,
  ExportFileFormat,
  PanelExportAction,
  PanelExportFilter,
  panelExportFileName,
} from './panelExportUrl';

export interface ExportedPanel {
  uuid: string;
  key?: string;
}

/**
 * Downloads a call's evaluations export or panel sheet, saying so when the
 * server refuses it -- a panel the reader does not sit on, say.
 */
export const usePanelExport = (call: Pick<Call, 'url' | 'slug' | 'uuid'>) => {
  const { showErrorResponse } = useNotify();
  return useCallback(
    async (
      action: PanelExportAction,
      fileFormat: ExportFileFormat,
      panel?: ExportedPanel,
      filter?: Omit<PanelExportFilter, 'panel_uuid'>,
    ) => {
      try {
        await downloadFile(
          buildPanelExportUrl(call, action, fileFormat, {
            ...filter,
            panel_uuid: panel?.uuid,
          }),
          panelExportFileName(call, action, fileFormat, panel),
        );
      } catch (error) {
        showErrorResponse(error, translate('Unable to download the export.'));
      }
    },
    [call, showErrorResponse],
  );
};
