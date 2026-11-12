import classNames from 'classnames';
import React, { FC } from 'react';
import { translate } from 'waldur-i18n-runtime';

import { COLUMN_ACTIONS_KEY } from './constants';
import { getPinnedActionsClasses } from './styles';
import { PinnedColumns, TableProps } from './types';

interface TableActionsHeadProps {
  pinnedColumns: PinnedColumns;
}

export const TableActionsHead: FC<TableActionsHeadProps> = ({
  pinnedColumns,
}) => {
  const isPinned = COLUMN_ACTIONS_KEY in pinnedColumns;
  const isFloating = Boolean(pinnedColumns[COLUMN_ACTIONS_KEY]);

  return (
    <th
      data-slot="header-actions"
      className={classNames(
        'h-[44px] w-[50px] py-0 px-2 last:pe-[var(--table-edge-px,9.75px)] align-middle text-left text-xs font-medium text-quaternary whitespace-nowrap',
        getPinnedActionsClasses(isPinned, isFloating),
      )}
    >
      {translate('Actions')}
    </th>
  );
};

/**
 * Renders a table's `rowActions`. Callers usually pass an inline arrow,
 * which is a new function on every parent render. Calling it as a render
 * function inside this stable component keeps the cell mounted across refetches.
 */
const RowActionsCell = ({
  rowActions,
  row,
  fetch,
}: {
  rowActions: TableProps['rowActions'];
  row: any;
  fetch: TableProps['fetch'];
}) =>
  typeof rowActions === 'function' && !rowActions.prototype?.isReactComponent
    ? (rowActions as (props: { row; fetch }) => React.ReactNode)({ row, fetch })
    : React.createElement(rowActions!, { row, fetch });

interface TableActionsCellProps {
  rowActions: TableProps['rowActions'];
  row: any;
  fetch: TableProps['fetch'];
  pinnedColumns: PinnedColumns;
}

export const TableActionsCell: FC<TableActionsCellProps> = ({
  rowActions,
  row,
  fetch,
  pinnedColumns,
}) => {
  const isPinned = COLUMN_ACTIONS_KEY in pinnedColumns;
  const isFloating = Boolean(pinnedColumns[COLUMN_ACTIONS_KEY]);

  return (
    <td
      data-slot="row-actions"
      className={classNames(
        'h-[44px] py-0 px-2 last:pe-[var(--table-edge-px,9.75px)] align-middle text-quaternary',
        getPinnedActionsClasses(isPinned, isFloating),
      )}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-center gap-[9.75px]">
        <RowActionsCell rowActions={rowActions} row={row} fetch={fetch} />
      </div>
    </td>
  );
};
