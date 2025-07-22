import { FC, ReactNode } from 'react';

import { ActionsDropdownComponent } from './ActionsDropdown';
import { TableExportButton } from './TableExportButton';
import { TableProps } from './types';

interface TableMoreActionsProps extends TableProps {
  actions?: ReactNode;
  showExport?: boolean;
}

export const TableMoreActions: FC<TableMoreActionsProps> = (props) => {
  return (
    <ActionsDropdownComponent labeled drop="down" size="md">
      {props.showExport && <TableExportButton {...props} asDropdownItem />}
      {props.actions}
    </ActionsDropdownComponent>
  );
};
