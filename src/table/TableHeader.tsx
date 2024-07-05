import { CaretDown, CaretUp, CaretUpDown } from '@phosphor-icons/react';
import classNames from 'classnames';
import { FC } from 'react';
import { FormCheck } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

import './TableHeader.scss';

import { TableProps } from './Table';
import { Column, Sorting } from './types';

interface TableHeaderProps {
  columns: Column[];
  onSortClick?(sorting: Sorting): void;
  currentSorting?: Sorting;
  expandableRow?: boolean;
  showActions?: boolean;
  rows: any[];
  enableMultiSelect?: boolean;
  onSelectAllRows?(rows: any[]): void;
  selectedRows?: any[];
  fieldType?: TableProps['fieldType'];
  activeColumns?: Record<string, boolean>;
}

function handleOrdering(currentSorting: Sorting, field: string): Sorting {
  let mode: 'asc' | 'desc' = 'asc';
  if (field === currentSorting.field) {
    if (currentSorting.mode === 'asc') {
      mode = 'desc';
    } else if (currentSorting.mode === 'desc') {
      mode = 'asc';
    }
  }
  return { field, mode };
}

function renderSortingIcon(column: Column, sorting: Sorting) {
  if (!column.orderField || !sorting) {
    return null;
  } else if (column.orderField !== sorting.field) {
    return <CaretUpDown size={17} width={30} />;
  } else if (sorting.mode === 'asc') {
    return <CaretUp size={17} width={30} />;
  } else {
    return <CaretDown size={17} width={30} />;
  }
}

const TableTh = ({ column, onSortClick, currentSorting }) => (
  <th
    className={
      classNames(column.className, column.orderField && 'sorting-column') ||
      undefined
    }
    onClick={
      column.orderField &&
      (() => onSortClick(handleOrdering(currentSorting, column.orderField)))
    }
  >
    {column.title}
    {renderSortingIcon(column, currentSorting)}
  </th>
);

export const TableHeader: FC<TableHeaderProps> = ({
  columns,
  onSortClick,
  currentSorting,
  expandableRow = false,
  showActions,
  rows,
  enableMultiSelect,
  onSelectAllRows,
  selectedRows,
  fieldType,
}) => {
  const isAllSelected = selectedRows?.length >= rows?.length;

  return (
    <thead>
      <tr className="text-start text-muted bg-light fw-bolder fs-7 text-uppercase gs-0">
        {fieldType ? (
          <th style={{ width: '10px' }} />
        ) : enableMultiSelect ? (
          <th style={{ width: '10px' }}>
            <FormCheck
              className="form-check form-check-custom form-check-sm"
              checked={isAllSelected}
              onChange={() => onSelectAllRows(rows)}
            />
          </th>
        ) : null}
        {expandableRow && <th style={{ width: '10px' }} />}
        {columns.map(
          (column, index) =>
            (column.visible ?? true) && (
              <TableTh
                key={index}
                column={column}
                onSortClick={onSortClick}
                currentSorting={currentSorting}
              />
            ),
        )}
        {showActions ? (
          <th className="header-actions">{translate('Actions')}</th>
        ) : null}
      </tr>
    </thead>
  );
};
