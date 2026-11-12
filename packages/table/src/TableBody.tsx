import classNames from 'classnames';
import React, {
  Fragment,
  FunctionComponent,
  memo,
  useCallback,
  useId,
  useMemo,
} from 'react';
import { Field, useFormState } from 'react-final-form';

import { ROW_VARIANT_BG_VARS } from './constants';
import { TableActionsCell } from './TableActionsColumn';
import { TableControlCell } from './TableControlColumn';
import { TableDataCell } from './TableDataCell';
import { RowExpander, TableExpandedRow } from './TableExpandable';
import { Column, PinnedColumns, PinnedOffsets, TableProps } from './types';
import { getColumnPinKey, getId } from './utils';

interface TableBodyProps extends Pick<
  TableProps,
  | 'rows'
  | 'columns'
  | 'rowClass'
  | 'rowVariant'
  | 'rowKey'
  | 'expandableRow'
  | 'expandableRowClassName'
  | 'rowActions'
  | 'onRowClick'
  | 'enableMultiSelect'
  | 'selectRow'
  | 'selectedRows'
  | 'toggleRow'
  | 'toggled'
  | 'fetch'
  | 'fieldType'
  | 'fieldName'
  | 'fullWidth'
  | 'validate'
  | 'rowValidate'
  | 'columnPositions'
  | 'hasOptionalColumns'
  | 'isRowExpandable'
  | 'rowGroupHeader'
> {
  pinnedColumns?: PinnedColumns;
  pinnedOffsets?: PinnedOffsets;
}

interface TableCellsProps {
  row: any;
  columns: TableProps['columns'];
  columnsMap: Record<string, Column>;
  columnPositions: TableProps['columnPositions'];
  hasOptionalColumns: TableProps['hasOptionalColumns'];
  pinnedColumns: PinnedColumns;
  pinnedOffsets: PinnedOffsets;
  expander?: RowExpander;
  hasLeadingCheckbox?: boolean;
}

const TableCells = memo(
  ({
    row,
    columns,
    columnsMap,
    columnPositions,
    hasOptionalColumns,
    pinnedColumns,
    pinnedOffsets,
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
                  <TableDataCell
                    column={columnsMap[id]}
                    row={row}
                    isFirstColumn={index === firstVisibleIndex}
                    expander={expander}
                    hasLeadingCheckbox={hasLeadingCheckbox}
                    pinned={id in pinnedColumns}
                    shadow={pinnedColumns[id]}
                    pinOffset={pinnedOffsets[id]}
                  />
                </Fragment>
              ))
          : columns.map((column, colIndex) => {
              const pinKey = getColumnPinKey(column, colIndex);
              return (
                <Fragment key={colIndex}>
                  <TableDataCell
                    column={column}
                    row={row}
                    isFirstColumn={colIndex === firstVisibleIndex}
                    expander={expander}
                    hasLeadingCheckbox={hasLeadingCheckbox}
                    pinned={pinKey in pinnedColumns}
                    shadow={pinnedColumns[pinKey]}
                    pinOffset={pinnedOffsets[pinKey]}
                  />
                </Fragment>
              );
            })}
      </>
    );
  },
);

TableCells.displayName = 'TableCells';

interface TableRowProps {
  row: any;
  rowIndex: number;
  rowKey: string;
  rowClass: TableProps['rowClass'];
  rowVariant: TableProps['rowVariant'];
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
  pinnedOffsets: PinnedOffsets;
  onRowClick: (row: any, index: number) => void;
  onChangeField: (row: any, input: any) => void;
  fieldProps?: { input: any; meta: any };
  rowError?: string | string[];
  isRowExpandable?: (row: any) => boolean;
  detailsId?: string;
}

const TableRow = memo<TableRowProps>(
  ({
    row,
    rowIndex,
    rowKey,
    rowClass,
    rowVariant,
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
    pinnedOffsets,
    onRowClick,
    onChangeField,
    fieldProps,
    rowError,
    isRowExpandable,
    detailsId,
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
    const isExpanded = Boolean(
      canExpand && toggled[getId(row, rowIndex, rowKey)],
    );
    const toggleExpanded = useCallback(
      () => onRowClick(row, rowIndex),
      [onRowClick, row, rowIndex],
    );
    const expander = useMemo(
      () =>
        expandableRow
          ? {
              canExpand: Boolean(canExpand),
              isExpanded,
              onToggle: toggleExpanded,
              detailsId: detailsId!,
            }
          : undefined,
      [expandableRow, canExpand, isExpanded, toggleExpanded, detailsId],
    );

    const variant =
      typeof rowVariant === 'function' ? rowVariant({ row }) : rowVariant;
    const isRowChecked = Boolean(fieldType && isChecked);

    return (
      <tr
        data-slot="table-row"
        // The expander button carries aria-expanded; the row only needs a
        // styling hook, and aria-expanded is not allowed on a plain table row.
        data-state={
          isExpanded ? 'expanded' : isRowChecked ? 'selected' : undefined
        }
        className={classNames(
          'group/row relative border-b last:border-b-0 border-solid border-secondary bg-[var(--table-row-bg)]',
          typeof rowClass === 'function' ? rowClass({ row }) : rowClass,
          // Exactly one --table-row-bg class: two of them have the same
          // specificity, so the stylesheet's order would pick the winner.
          isExpanded || isRowChecked
            ? '[--table-row-bg:var(--bg-secondary)]'
            : variant
              ? ROW_VARIANT_BG_VARS[variant]
              : '[--table-row-bg:var(--table-body-bg,var(--bg-primary))]',
          isRowChecked && '[&>*]:border-0',
        )}
        onClick={handleRowClick}
      >
        {(enableMultiSelect || fieldType) && (
          <TableControlCell
            fieldType={fieldType}
            fieldProps={fieldProps}
            rowError={rowError}
            isChecked={isChecked}
            onFieldChange={handleFieldChange}
            onSelectRow={handleSelectRow}
          />
        )}
        <TableCells
          row={row}
          columns={columns}
          columnsMap={columnsMap}
          columnPositions={columnPositions}
          hasOptionalColumns={hasOptionalColumns}
          pinnedColumns={pinnedColumns}
          pinnedOffsets={pinnedOffsets}
          expander={expander}
          hasLeadingCheckbox={Boolean(enableMultiSelect || fieldType)}
        />
        {rowActions && (
          <TableActionsCell
            rowActions={rowActions}
            row={row}
            fetch={fetch}
            pinnedColumns={pinnedColumns}
          />
        )}
      </tr>
    );
  },
  (prevProps, nextProps) => {
    const { rowActions: _prevRowActions, ...prevRest } = prevProps;
    const { rowActions: _nextRowActions, ...nextRest } = nextProps;
    const keys = Object.keys(prevRest) as (keyof typeof prevRest)[];
    return keys.every((key) => prevRest[key] === nextRest[key]);
  },
);

TableRow.displayName = 'TableRow';

interface FieldRowBodyProps {
  row: any;
  rowIndex: number;
  input: any;
  meta: any;
  rowValidate?: TableProps['rowValidate'];
  renderRow: (
    row: any,
    rowIndex: number,
    fieldProps?: { input: any; meta: any } | null,
    rowError?: string | string[],
  ) => JSX.Element;
}

const FieldRowBody: FunctionComponent<FieldRowBodyProps> = ({
  row,
  rowIndex,
  input,
  meta,
  rowValidate,
  renderRow,
}) => {
  const { values } = useFormState({ subscription: { values: true } });
  const rawError = rowValidate ? rowValidate(row, values) : undefined;
  const rowError =
    Array.isArray(rawError) && rawError.length === 0 ? undefined : rawError;
  return renderRow(row, rowIndex, { input, meta }, rowError || undefined);
};

export const TableBody: FunctionComponent<TableBodyProps> = memo(
  ({
    rows,
    columns,
    rowClass,
    rowVariant,
    rowKey = 'uuid',
    expandableRow,
    expandableRowClassName,
    rowActions,
    onRowClick: onRowClickProp,
    enableMultiSelect,
    selectRow,
    selectedRows,
    toggleRow,
    toggled,
    fetch,
    fieldType,
    fieldName,
    fullWidth: isFullWidthCard = false,
    validate,
    rowValidate,
    columnPositions,
    hasOptionalColumns,
    pinnedColumns = {},
    pinnedOffsets = {},
    isRowExpandable,
    rowGroupHeader,
  }) => {
    const detailsIdPrefix = useId();
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
        onRowClickProp?.(row);
        if (!expandableRow) return;
        toggleRow(getId(row, index, rowKey));
      },
      [onRowClickProp, expandableRow, toggleRow, rowKey],
    );

    const onChangeField = useCallback(
      (row, input) => {
        if (fieldType === 'checkbox') {
          const newValues: any[] = input.value || [];
          const index = newValues.findIndex((v) => v[rowKey] === row[rowKey]);
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

    const renderRow = useCallback(
      (
        row,
        rowIndex: number,
        fieldProps = null,
        rowError: string | string[] | undefined = undefined,
      ) => (
        <TableRow
          row={row}
          rowIndex={rowIndex}
          rowKey={rowKey}
          rowClass={rowClass}
          rowVariant={rowVariant}
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
          pinnedOffsets={pinnedOffsets}
          onRowClick={onRowClick}
          onChangeField={onChangeField}
          fieldProps={fieldProps}
          rowError={rowError}
          isRowExpandable={isRowExpandable}
          detailsId={`${detailsIdPrefix}-details-${rowIndex}`}
        />
      ),
      [
        rowKey,
        rowClass,
        rowVariant,
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
        pinnedOffsets,
        onRowClick,
        onChangeField,
        detailsIdPrefix,
        isRowExpandable,
      ],
    );

    const colSpanCount =
      columns.length +
      (rowActions ? 1 : 0) +
      (enableMultiSelect || fieldType ? 1 : 0);

    return (
      <tbody>
        {rows.map((row, rowIndex) => {
          const canExpand = expandableRow && (isRowExpandable?.(row) ?? true);
          const groupHeader = rowGroupHeader?.({ row, rowIndex, rows });
          return (
            <React.Fragment key={getId(row, rowIndex, rowKey)}>
              {groupHeader ? (
                <tr
                  data-slot="table-group-header"
                  className="border-b last:border-b-0 border-solid border-secondary [--table-row-bg:var(--table-body-bg,var(--bg-primary))] bg-[var(--table-row-bg)]"
                >
                  <th
                    colSpan={colSpanCount}
                    data-testid="table-group-header"
                    className="h-[44px] py-[6.5px] px-[9.75px] first:ps-[var(--table-edge-px,9.75px)] last:pe-[var(--table-edge-px,9.75px)] text-start font-normal whitespace-normal text-primary"
                  >
                    {groupHeader}
                  </th>
                </tr>
              ) : null}
              {fieldType ? (
                <Field name={fieldName} validate={validate as any}>
                  {({ input, meta }) => (
                    <FieldRowBody
                      row={row}
                      rowIndex={rowIndex}
                      input={input}
                      meta={meta}
                      rowValidate={rowValidate}
                      renderRow={renderRow}
                    />
                  )}
                </Field>
              ) : (
                renderRow(row, rowIndex)
              )}
              {canExpand && toggled[getId(row, rowIndex, rowKey)] && (
                <TableExpandedRow
                  colSpanCount={colSpanCount}
                  detailsId={`${detailsIdPrefix}-details-${rowIndex}`}
                  expandableRowClassName={expandableRowClassName}
                  hasLeadingCheckbox={Boolean(enableMultiSelect || fieldType)}
                  fullWidth={isFullWidthCard}
                >
                  {React.createElement(expandableRow, { row, fetch })}
                </TableExpandedRow>
              )}
            </React.Fragment>
          );
        })}
      </tbody>
    );
  },
);

(TableBody as FunctionComponent).displayName = 'TableBody';
