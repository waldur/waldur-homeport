import { DownloadSimpleIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { translate } from '@/i18n';
import {
  ExportedPanel,
  usePanelExport,
} from '@/proposals/manage/usePanelExport';
import { ActionItem } from '@/resource/actions/ActionItem';

import { Call } from '../../types';

interface PanelExportActionsProps {
  call: Pick<Call, 'url' | 'slug' | 'uuid'>;
  panel: ExportedPanel;
}

/**
 * A panel's sheet for its meeting -- one row per proposal routed to it -- and
 * every contribution to the evaluation of its proposals. The call's managers
 * and the panel's chair and members download them; each reads in them what
 * the proposal pages show them.
 */
export const PanelExportActions: FC<PanelExportActionsProps> = ({
  call,
  panel,
}) => {
  const download = usePanelExport(call);
  const icon = <DownloadSimpleIcon weight="bold" />;
  return (
    <>
      <ActionItem
        title={translate('Panel sheet (Excel)')}
        iconNode={icon}
        action={() => download('export-panel-sheet', 'xlsx', panel)}
      />
      <ActionItem
        title={translate('Panel sheet (CSV)')}
        iconNode={icon}
        action={() => download('export-panel-sheet', 'csv', panel)}
      />
      <ActionItem
        title={translate('Evaluations (Excel)')}
        iconNode={icon}
        action={() => download('export-evaluations', 'xlsx', panel)}
      />
      <ActionItem
        title={translate('Evaluations (CSV)')}
        iconNode={icon}
        action={() => download('export-evaluations', 'csv', panel)}
      />
    </>
  );
};
