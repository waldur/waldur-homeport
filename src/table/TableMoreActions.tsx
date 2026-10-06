import { FC, ReactNode } from 'react';

import { ActionsMenu } from './ActionsDropdown';
import { TableExportButton } from './TableExportButton';
import { TableProps } from './types';

interface TableMoreActionsProps extends TableProps {
  actions?: ReactNode;
  showExport?: boolean;
  size?: 'sm' | 'lg';
}

export const TableMoreActions: FC<TableMoreActionsProps> = (props) => {
  return (
    <ActionsMenu
      toggle="labeled"
      side="bottom"
      size={props.size ?? props.dropdownActionsSize ?? 'lg'}
    >
      {props.showExport && <TableExportButton {...props} asDropdownItem />}
      {props.actions}
    </ActionsMenu>
  );
};
