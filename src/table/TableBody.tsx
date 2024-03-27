import classNames from 'classnames';
import React, { FunctionComponent, useCallback, useEffect } from 'react';
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
  | 'hoverableRow'
  | 'enableMultiSelect'
  | 'selectRow'
  | 'selectedRows'
  | 'toggleRow'
  | 'toggled'
  | 'fetch'
  | 'fieldType'
  | 'fieldName'
  | 'validate'
>;

const TableCells = ({ row, columns }) => (
  <>
    {columns.map(
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
  hoverableRow,
  enableMultiSelect,
  selectRow,
  selectedRows,
  toggleRow,
  toggled,
  fetch,
  fieldType,
  fieldName,
  validate,
}) => {
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
          </td>
        )}
        {expandableRow && (
          <td>
            {toggled[getId(row, rowIndex)] ? (
              <i className="fa fa-chevron-down" />
            ) : (
              <i className="fa fa-chevron-right" />
            )}
          </td>
        )}
        <TableCells row={row} columns={columns} />
        {hoverableRow && (
          <td className="row-actions">
            <div>{React.createElement(hoverableRow, { row, fetch })}</div>
          </td>
        )}
      </tr>
    );
  };

  /**
   * We have an issue in displaying the dropdown actions inside the responsive table.
   * The dropdown goes under the edges of the table, because the responsive table has auto overflow.
   * The following approach fixes this issue by detaching the dropdown from the table and append it to the <body>.
   */
  useEffect(() => {
    async function clickListener(e) {
      // if the button is inside a modal
      if (document.body.className.includes('modal-open')) {
        // This solution is not working inside a responsive table inside a modal,
        // you need to find out a way to calculate the modal Z-index and add it to the element
        return true;
      }
      if (
        e.target.className &&
        e.target.className.includes('dropdown-toggle')
      ) {
        const dropdownToggle: HTMLButtonElement = e.target;
        const buttonGroup = dropdownToggle.parentElement;
        let dropdownMenu: HTMLElement;
        let shouldAttach;
        if (!buttonGroup.hasAttribute('data-attached')) {
          const ts = +new Date();
          dropdownMenu = dropdownToggle.nextSibling as HTMLElement;
          let retryCount = 0;
          while (!dropdownMenu && retryCount < 10) {
            retryCount++;
            await new Promise((resolve) =>
              setTimeout(() => resolve(true), 100),
            );
            dropdownMenu = dropdownToggle.nextSibling as HTMLElement;
          }
          if (!dropdownMenu) return;
          buttonGroup.setAttribute('data-attached', String(ts));
          dropdownMenu.setAttribute('data-parent', String(ts));
          shouldAttach = true;
        } else {
          dropdownMenu = document.querySelector(
            '[data-parent="' + buttonGroup.getAttribute('data-attached') + '"]',
          );
          shouldAttach = false;
        }
        if (!buttonGroup.className.includes('show')) {
          dropdownMenu.style.display = 'none';
          return;
        }

        // Fix dropdown position
        dropdownMenu.style.position = 'absolute';
        dropdownMenu.style.display = 'block';

        if (shouldAttach) document.body.append(dropdownMenu);
      }
    }

    function hideAllDropdownMenus() {
      // hide all dropdowns attached to body
      document
        .querySelectorAll('.dropdown-menu[data-parent]')
        .forEach((itemMenu: HTMLElement) => {
          itemMenu.style.display = 'none';
        });
    }
    document.addEventListener('click', hideAllDropdownMenus);
    document.addEventListener('click', clickListener);

    return () => {
      document.removeEventListener('click', hideAllDropdownMenus);
      document.removeEventListener('click', clickListener);
    };
  }, []);

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
              <td colSpan={columns.length + 1}>
                {React.createElement(expandableRow, { row })}
              </td>
            </tr>
          )}
        </React.Fragment>
      ))}
    </tbody>
  );
};
