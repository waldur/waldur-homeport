import {
  CaretDownIcon,
  FunnelSimpleIcon,
  SquareLogoIcon,
  WarningCircleIcon,
} from '@phosphor-icons/react';
import classNames from 'classnames';
import React, {
  Fragment,
  FunctionComponent,
  memo,
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import { FormCheck } from 'react-bootstrap';
import { Field } from 'redux-form';

import { CopyToClipboardButton } from '@/core/CopyToClipboardButton';
import { Tip } from '@/core/Tooltip';
import { translate } from '@/i18n';
import { MenuComponent } from '@/metronic/components';

import { COLUMN_ACTIONS_KEY } from './constants';
import { TableFilterContext } from './FilterContextProvider';
import { Column, PinnedColumns, TableProps } from './types';
import { getId } from './utils';

interface TableBodyProps extends Pick<
  TableProps,
  | 'rows'
  | 'columns'
  | 'rowClass'
  | 'rowKey'
  | 'expandableRow'
  | 'expandableRowClassName'
  | 'rowActions'
  | 'enableMultiSelect'
  | 'selectRow'
  | 'selectedRows'
  | 'toggleRow'
  | 'toggled'
  | 'fetch'
  | 'fieldType'
  | 'fieldName'
  | 'validate'
  | 'columnPositions'
  | 'hasOptionalColumns'
  | 'isRowExpandable'
> {
  pinnedColumns?: PinnedColumns;
}

interface TableCellsProps {
  row;
  columns: TableProps['columns'];
  columnsMap: Record<string, Column>;
  columnPositions: TableProps['columnPositions'];
  hasOptionalColumns: TableProps['hasOptionalColumns'];
  expander?: {
    canExpand: boolean;
    isExpanded: boolean;
  };
  hasLeadingCheckbox?: boolean;
}

const InlineFilterButton = memo(({ column, row }: { column: Column; row }) => {
  const { filterComponents, apply, changeFormField } =
    React.useContext(TableFilterContext);

  const callback = useCallback(() => {
    const filterConfig = filterComponents.find(
      (comp) => comp.name === column.filter,
    );
    const value = column.inlineFilter(row);
    filterConfig.setFilter(value);
    changeFormField(column.filter, value);
    apply();
  }, [filterComponents, column, row, changeFormField, apply]);

  return (
    <>
      <button
        type="button"
        className="inline-filter btn btn-icon btn-sm btn-tertiary icon-align"
        data-kt-menu-trigger="click"
        data-kt-menu-placement="bottom"
      >
        <Tip
          id={'tip-filter-' + column.title.toString().slice(0, 2) + row.uuid}
          label={translate('Add filter')}
          delay={{ show: 1000, hide: 0 }}
        >
          <FunnelSimpleIcon weight="bold" size={20} />
        </Tip>
      </button>
      <div
        className="menu menu-sub menu-sub-dropdown menu-column menu-gray-700 menu-state-bg-gray w-auto min-w-150px py-1 fw-bold"
        data-kt-menu="true"
      >
        <div className="menu-item">
          <span
            className="menu-link px-5 py-3"
            aria-hidden="true"
            onClick={callback}
          >
            <span className="menu-icon w-auto me-4">
              <SquareLogoIcon weight="bold" size={20} />
            </span>
            <span className="menu-title">{translate('Filter by')}</span>
          </span>
        </div>
      </div>
    </>
  );
});

InlineFilterButton.displayName = 'InlineFilterButton';

const hasFilterMenu = (key: string) => {
  const item = document.querySelector(
    '#kt_content_container .table-filters-menu #filter-item-' + key,
  );
  return Boolean(item);
};

const TableCell = memo(
  ({
    column,
    row,
    isFirstColumn,
    expander,
    hasLeadingCheckbox,
  }: {
    column: Column;
    row;
    isFirstColumn?: boolean;
    expander?: {
      canExpand: boolean;
      isExpanded: boolean;
    };
    hasLeadingCheckbox?: boolean;
  }) => {
    // Skip rendering if column is not visible
    if (column.visible === false) {
      return null;
    }

    if (!column.render || typeof column.render !== 'function') {
      return null;
    }

    const renderedContent = React.createElement(column.render, {
      row,
    });

    if (renderedContent === undefined || renderedContent === null) {
      return null;
    }
    const valueToCopy = column.copyField ? column.copyField(row) : '';
    const hasFilter = column.inlineFilter && hasFilterMenu(column.filter);

    const cellClassName = classNames(
      column.className,
      column.inlineFilter && 'has-filter',
      (column.ellipsis ?? true) && 'ellipsis',
    );

    const content = column.copyField ? (
      <>
        <div className="with-copy d-flex align-items-center gap-1">
          <div className="td-data">{renderedContent}</div>
          <CopyToClipboardButton value={valueToCopy} />
        </div>
        {hasFilter && <InlineFilterButton column={column} row={row} />}
      </>
    ) : (
      <>
        {hasFilter ? (
          <div className="td-data">{renderedContent}</div>
        ) : (
          renderedContent
        )}
        {hasFilter && <InlineFilterButton column={column} row={row} />}
      </>
    );

    const handleClick = column.disabledClick
      ? (e: React.MouseEvent) => e.stopPropagation()
      : undefined;

    // First data column: render expander icon and text in the same cell.
    if (isFirstColumn && expander) {
      return (
        <td
          className={cellClassName}
          onClick={handleClick}
          style={{ paddingLeft: 0, paddingRight: 0 }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              paddingLeft: hasLeadingCheckbox ? 12 : 16,
              paddingRight: 16,
              columnGap: 12,
            }}
          >
            {expander.canExpand && (
              <span
                data-testid="row-expander"
                className={classNames({ active: expander.isExpanded })}
              >
                <CaretDownIcon size={20} weight="bold" className="rotate-180" />
              </span>
            )}
            <div style={{ minWidth: 0, flex: '1 1 auto' }}>{content}</div>
          </div>
        </td>
      );
    }

    return (
      <td className={cellClassName} onClick={handleClick}>
        {content}
      </td>
    );
  },
);

TableCell.displayName = 'TableCell';

const TableCells = memo(
  ({
    row,
    columns,
    columnsMap,
    columnPositions,
    hasOptionalColumns,
    expander,
    hasLeadingCheckbox,
  }: TableCellsProps) => {
    const firstVisibleIndex = hasOptionalColumns
      ? columnPositions
          .filter((id) => columnsMap[id])
          .findIndex((id) => columnsMap[id].visible !== false)
      : columns.findIndex((col) => col.visible !== false);

    return (
      <>
        {hasOptionalColumns
          ? columnPositions
              .filter((id) => columnsMap[id])
              .map((id, index) => (
                <Fragment key={id}>
                  <TableCell
                    column={columnsMap[id]}
                    row={row}
                    isFirstColumn={index === firstVisibleIndex}
                    expander={expander}
                    hasLeadingCheckbox={hasLeadingCheckbox}
                  />
                </Fragment>
              ))
          : columns.map((column, colIndex) => (
              <Fragment key={colIndex}>
                <TableCell
                  column={column}
                  row={row}
                  isFirstColumn={colIndex === firstVisibleIndex}
                  expander={expander}
                  hasLeadingCheckbox={hasLeadingCheckbox}
                />
              </Fragment>
            ))}
      </>
    );
  },
);

TableCells.displayName = 'TableCells';

interface TableRowProps {
  row;
  rowIndex: number;
  rowKey: string;
  rowClass: TableProps['rowClass'];
  expandableRow: TableProps['expandableRow'];
  toggled: TableProps['toggled'];
  fieldType: TableProps['fieldType'];
  enableMultiSelect: TableProps['enableMultiSelect'];
  selectRow: TableProps['selectRow'];
  selectedRows: TableProps['selectedRows'];
  rowActions: TableProps['rowActions'];
  fetch: TableProps['fetch'];
  columns: TableProps['columns'];
  columnsMap: Record<string, Column>;
  columnPositions: TableProps['columnPositions'];
  hasOptionalColumns: TableProps['hasOptionalColumns'];
  pinnedColumns: PinnedColumns;
  onRowClick: (row, index: number) => void;
  onChangeField: (row, input) => void;
  fieldProps?: { input; meta };
  isRowExpandable?: (row: any) => boolean;
}

const TableRow = memo<TableRowProps>(
  ({
    row,
    rowIndex,
    rowKey,
    rowClass,
    expandableRow,
    toggled,
    fieldType,
    enableMultiSelect,
    selectRow,
    selectedRows,
    rowActions,
    fetch,
    columns,
    columnsMap,
    columnPositions,
    hasOptionalColumns,
    pinnedColumns,
    onRowClick,
    onChangeField,
    fieldProps,
    isRowExpandable,
  }) => {
    const isRowSelected = useMemo(() => {
      if (!selectedRows) return false;
      return selectedRows.some((item) => item[rowKey] === row[rowKey]);
    }, [selectedRows, rowKey, row]);

    let isChecked = false;
    if (fieldProps) {
      if (Array.isArray(fieldProps.input.value)) {
        isChecked = fieldProps.input.value.some(
          (v) => v[rowKey] === row[rowKey],
        );
      } else {
        isChecked = fieldProps.input.value?.[rowKey] === row[rowKey];
      }
    } else {
      isChecked = isRowSelected;
    }

    const handleRowClick = useCallback(
      (event: React.MouseEvent) => {
        // prevent checkbox and expandable row to toggle when clicking on inner clickable elements
        const el = event.target as HTMLElement;
        if (
          el.onclick ||
          el instanceof HTMLInputElement ||
          el.closest('button, a')
        )
          return;

        onRowClick(row, rowIndex);
        if (fieldProps && !expandableRow) {
          onChangeField(row, fieldProps.input);
        }
      },
      [row, rowIndex, fieldProps, expandableRow, onRowClick, onChangeField],
    );

    const handleSelectRow = useCallback(() => {
      selectRow(row);
    }, [selectRow, row]);

    const handleFieldChange = useCallback(() => {
      if (fieldProps) {
        onChangeField(row, fieldProps.input);
      }
    }, [fieldProps, row, onChangeField]);

    const canExpand = expandableRow && (isRowExpandable?.(row) ?? true);
    const isExpanded = Boolean(canExpand && toggled[getId(row, rowIndex)]);

    return (
      <tr
        className={
          classNames(
            typeof rowClass === 'function' ? rowClass({ row }) : rowClass,
            {
              expanded: canExpand && toggled[getId(row, rowIndex)],
              checked: fieldType && isChecked,
            },
          ) || undefined
        }
        onClick={handleRowClick}
      >
        {(enableMultiSelect || fieldType) && (
          <td className="row-control" style={{ paddingLeft: '16px' }}>
            <div>
              {fieldType && fieldProps ? (
                <>
                  {isChecked &&
                    fieldProps.meta.touched &&
                    fieldProps.meta.error && (
                      <Tip
                        label={fieldProps.meta.error}
                        id={`tableErrorTip-${rowIndex}`}
                        className="error-mark"
                      >
                        <WarningCircleIcon weight="bold" />
                      </Tip>
                    )}
                  <FormCheck
                    name={fieldProps.input.name}
                    type={fieldType}
                    className="form-check form-check-custom"
                    checked={isChecked}
                    onChange={handleFieldChange}
                    onClick={(e) => e.stopPropagation()}
                  />
                </>
              ) : (
                <FormCheck
                  className="form-check form-check-custom form-check-md"
                  checked={isChecked}
                  onChange={handleSelectRow}
                />
              )}
            </div>
          </td>
        )}
        <TableCells
          row={row}
          columns={columns}
          columnsMap={columnsMap}
          columnPositions={columnPositions}
          hasOptionalColumns={hasOptionalColumns}
          expander={
            expandableRow
              ? {
                  canExpand,
                  isExpanded,
                }
              : undefined
          }
          hasLeadingCheckbox={Boolean(enableMultiSelect || fieldType)}
        />

        {rowActions && (
          <td
            className={classNames(
              'row-actions',
              COLUMN_ACTIONS_KEY in pinnedColumns && 'pinned',
              pinnedColumns[COLUMN_ACTIONS_KEY] && 'is-floating',
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <div aria-hidden="true">
              {React.createElement(rowActions, { row, fetch })}
            </div>
          </td>
        )}
      </tr>
    );
  },
  // Custom comparison to prevent re-renders when only rowActions changes
  // rowActions is a function that's often recreated on parent renders
  // but doesn't affect the row's visual rendering
  (prevProps, nextProps) => {
    // Compare all props except rowActions
    const { rowActions: _prevRowActions, ...prevRest } = prevProps;
    const { rowActions: _nextRowActions, ...nextRest } = nextProps;

    // Shallow compare remaining props
    const keys = Object.keys(prevRest) as (keyof typeof prevRest)[];
    return keys.every((key) => prevRest[key] === nextRest[key]);
  },
);

TableRow.displayName = 'TableRow';

export const TableBody: FunctionComponent<TableBodyProps> = memo(
  ({
    rows,
    columns,
    rowClass,
    rowKey = 'uuid',
    expandableRow,
    expandableRowClassName,
    rowActions,
    enableMultiSelect,
    selectRow,
    selectedRows,
    toggleRow,
    toggled,
    fetch,
    fieldType,
    fieldName,
    validate,
    columnPositions,
    hasOptionalColumns,
    pinnedColumns = {},
    isRowExpandable,
  }) => {
    const columnsMap = useMemo(
      () =>
        columns.reduce(
          (result, column) => ({ ...result, [column.id]: column }),
          {} as Record<string, Column>,
        ),
      [columns],
    );

    const onRowClick = useCallback(
      (row, index: number) => {
        if (!expandableRow) return;
        toggleRow(getId(row, index));
      },
      [expandableRow, toggleRow],
    );

    const onChangeField = useCallback(
      (row, input) => {
        if (fieldType === 'checkbox') {
          const newValues: any[] = input.value || [];
          const index = newValues.findIndex((v) => v[rowKey] === row[rowKey]);
          // Is field checked
          if (index > -1) {
            newValues.splice(index, 1);
          } else {
            newValues.push(row);
          }
          input.onChange(newValues);
        } else if (fieldType === 'radio') {
          input.onChange(row);
        }
        input.onBlur();
      },
      [fieldType, rowKey],
    );

    // Re-initialize menu popups when the rows are changed, so that the cell-filter popups works properly.
    useEffect(() => {
      MenuComponent.reinitialization();
    }, [rows?.length]);

    const renderRow = useCallback(
      (row, rowIndex: number, fieldProps = null) => (
        <TableRow
          row={row}
          rowIndex={rowIndex}
          rowKey={rowKey}
          rowClass={rowClass}
          expandableRow={expandableRow}
          toggled={toggled}
          fieldType={fieldType}
          enableMultiSelect={enableMultiSelect}
          selectRow={selectRow}
          selectedRows={selectedRows}
          rowActions={rowActions}
          fetch={fetch}
          columns={columns}
          columnsMap={columnsMap}
          columnPositions={columnPositions}
          hasOptionalColumns={hasOptionalColumns}
          pinnedColumns={pinnedColumns}
          onRowClick={onRowClick}
          onChangeField={onChangeField}
          fieldProps={fieldProps}
          isRowExpandable={isRowExpandable}
        />
      ),
      // Note: rowActions is intentionally excluded from dependencies
      // TableRow has a custom comparison function that ignores rowActions changes
      // to prevent unnecessary re-renders when parent creates new rowActions functions
      [
        rowKey,
        rowClass,
        expandableRow,
        toggled,
        fieldType,
        enableMultiSelect,
        selectRow,
        selectedRows,
        fetch,
        columns,
        columnsMap,
        columnPositions,
        hasOptionalColumns,
        pinnedColumns,
        onRowClick,
        onChangeField,
      ],
    );

    return (
      <tbody>
        {rows.map((row, rowIndex) => {
          const canExpand = expandableRow && (isRowExpandable?.(row) ?? true);
          return (
            <React.Fragment key={rowIndex}>
              {fieldType ? (
                <Field
                  name={fieldName}
                  component={(fieldProps) =>
                    renderRow(row, rowIndex, fieldProps)
                  }
                  validate={validate}
                />
              ) : (
                renderRow(row, rowIndex)
              )}
              {canExpand && toggled[getId(row, rowIndex)] && (
                <tr>
                  <td
                    colSpan={
                      columns.length +
                      (rowActions ? 1 : 0) +
                      (enableMultiSelect || fieldType ? 1 : 0)
                    }
                    className={expandableRowClassName}
                  >
                    {React.createElement(expandableRow, { row, fetch })}
                  </td>
                </tr>
              )}
            </React.Fragment>
          );
        })}
      </tbody>
    );
  },
);

(TableBody as FunctionComponent).displayName = 'TableBody';
