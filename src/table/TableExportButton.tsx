import { ExportIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';

import { BaseButton } from 'waldur-ui';

import { translate } from '@/i18n';
import { ActionItem } from '@/resource/actions/ActionItem';

import { TableProps } from './types';
import { useExportDialog } from './useExportDialog';

export const TableExportButton: FunctionComponent<
  TableProps & { asDropdownItem?: boolean }
> = (props) => {
  const openExportDialog = useExportDialog();
  return props.asDropdownItem ? (
    <ActionItem
      action={() => openExportDialog(props.table, 'clipboard', props)}
      title={translate('Export')}
      iconNode={<ExportIcon weight="bold" />}
      disabled={props.rows?.length === 0}
    />
  ) : (
    <BaseButton
      variant="tertiary"
      size="lg"
      label={translate('Export')}
      iconNode={<ExportIcon weight="bold" />}
      onClick={() => openExportDialog(props.table, 'clipboard', props)}
      disabled={props.rows?.length === 0}
      disabledReason={translate('No data to export')}
    />
  );
};
