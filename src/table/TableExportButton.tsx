import { ExportIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { Button } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { ActionItem } from '@waldur/resource/actions/ActionItem';

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
    <Button
      variant="outline-default"
      className="btn-outline"
      size="lg"
      onClick={() => openExportDialog(props.table, 'clipboard', props)}
      disabled={props.rows?.length === 0}
    >
      <span className="svg-icon svg-icon-2">
        <ExportIcon weight="bold" />
      </span>
      {translate('Export')}
    </Button>
  );
};
