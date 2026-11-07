import { ExportIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';

import { translate } from 'waldur-i18n-runtime';
import { BaseButton } from 'waldur-ui';

import { ActionItem } from '@/resource/actions/ActionItem';

import { TableProps } from './types';
import { useExportDialog } from './useExportDialog';

/**
 * The table's Export. Without a `table`, the dialog offers only the
 * `fullExport`: what a view without a table of its own exports.
 */
export const TableExportButton: FunctionComponent<
  Partial<TableProps> & { asDropdownItem?: boolean }
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
      size={props.dropdownActionsSize ?? 'lg'}
      label={translate('Export')}
      iconNode={<ExportIcon weight="bold" />}
      onClick={() => openExportDialog(props.table, 'clipboard', props)}
      disabled={props.rows?.length === 0}
      disabledReason={translate('No data to export')}
    />
  );
};
