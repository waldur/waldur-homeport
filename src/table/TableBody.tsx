import { CaretDown } from '@phosphor-icons/react';
import classNames from 'classnames';
import React, { FunctionComponent, useCallback, useMemo } from 'react';
import { FormCheck } from 'react-bootstrap';
import { Field } from 'redux-form';

import { Tip } from '@waldur/core/Tooltip';

import { TableProps } from './Table';
import { getId } from './utils';

type TableBodyProps = Pick<
  TableProps,
  | 'rows'
  | 'columns'
  | 'rowClass'
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
>;

const TableCells = ({
  row,
  columns,
  columnsMap,
  columnPositions,
  hasOptionalColumns,
}) => (
  <>
    {hasOptionalColumns
      ? columnPositions
          .filter((id) => columnsMap[id])
          .map(
            (id) =>
              (columnsMap[id].visible ?? true) && (
                <td key={id} className={columnsMap[id].className}>
                  {React.createElement(columnsMap[id].render, { row })}
                </td>
              ),
          )
      : columns.map(
          (column, colIndex) =>
            (column.visible ?? true) && (
              <td key={colIndex} className={column.className}>
                {React.createElement(column.render, { row })}
              </td>
            ),
        )}
  </>
);

export const TableBody: FunctionComponent<TableBodyProps> = ({
  rows,
  columns,
  rowClass,
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
}) => {
  const columnsMap = useMemo(
    () =>
      columns.reduce(
        (result, column) => ({ ...result, [column.id]: column }),
        {},
      ),
    [columns],
  );

  const trClick = useCallback(
    (row, index, e) => {
      if (!expandableRow) return;
      // prevent expandable row to toggle when clicking on inner clickable elements
      const el = e.target as HTMLElement;
      if (
        el.onclick ||
        el instanceof HTMLInputElement ||
        el.closest('button, a')
      )
        return;
      toggleRow(getId(row, index));
    },
    [toggleRow],
  );

  const isRowSelected = (row: any) => {
    if (!selectedRows) return false;
    return selectedRows.some((item) => item.uuid === row.uuid);
  };

  const onChangeField = useCallback(
    (row, input) => {
      if (fieldType === 'checkbox') {
        const newValues: any[] = input.value || [];
        const index = newValues.findIndex((v) => v.uuid === row.uuid);
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
    [fieldType],
  );

  const TR = (row, rowIndex, fieldProps = null) => {
    let isChecked = false;
    if (fieldProps) {
      if (Array.isArray(fieldProps.input.value)) {
        isChecked = fieldProps.input.value.some((v) => v.uuid === row.uuid);
      } else {
        isChecked = fieldProps.input.value?.uuid === row.uuid;
      }
    } else {
      isChecked = isRowSelected(row);
    }
    return (
      <tr
        className={
          classNames(
            typeof rowClass === 'function' ? rowClass({ row }) : rowClass,
            {
              expanded: expandableRow && toggled[getId(row, rowIndex)],
              checked: fieldType && isChecked,
            },
          ) || undefined
        }
        onClick={(event) => {
          trClick(row, rowIndex, event);
          if (fieldProps) {
            onChangeField(row, fieldProps.input);
          }
        }}
      >
        {(enableMultiSelect || fieldType) && (
          <td className="row-control">
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
                        <i className="fa fa-exclamation-circle" />
                      </Tip>
                    )}
                  <FormCheck
                    name={fieldProps.input.name}
                    type={fieldType}
                    className="form-check form-check-custom form-check-sm"
                    checked={isChecked}
                    onChange={() => onChangeField(row, fieldProps.input)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </>
              ) : (
                <FormCheck
                  className="form-check form-check-custom form-check-sm"
                  checked={isChecked}
                  onChange={() => selectRow(row)}
                />
              )}
            </div>
          </td>
        )}
        {expandableRow && (
          <td
            data-cy="row-expander"
            className={toggled[getId(row, rowIndex)] ? 'active' : ''}
          >
            <CaretDown size={20} weight="bold" className="rotate-180" />
          </td>
        )}
        <TableCells
          row={row}
          columns={columns}
          columnsMap={columnsMap}
          columnPositions={columnPositions}
          hasOptionalColumns={hasOptionalColumns}
        />
        {rowActions && (
          <td className="row-actions">
            <div>{React.createElement(rowActions, { row, fetch })}</div>
          </td>
        )}
      </tr>
    );
  };

  return (
    <tbody>
      {rows.map((row, rowIndex) => (
        <React.Fragment key={rowIndex}>
          {fieldType ? (
            <Field
              name={fieldName}
              component={(fieldProps) => TR(row, rowIndex, fieldProps)}
              validate={validate}
            />
          ) : (
            TR(row, rowIndex)
          )}
          {expandableRow && toggled[getId(row, rowIndex)] && (
            <tr className={expandableRowClassName}>
              <td colSpan={columns.length + 1 + (rowActions ? 1 : 0)}>
                {React.createElement(expandableRow, { row })}
              </td>
            </tr>
          )}
        </React.Fragment>
      ))}
    </tbody>
  );
};
