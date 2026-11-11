import { WarningCircleIcon } from '@phosphor-icons/react';
import classNames from 'classnames';
import React, { FC, useEffect, useRef } from 'react';

import { translate } from 'waldur-i18n-runtime';
import { Checkbox, Radio, Tooltip } from 'waldur-ui';

import { FieldErrorMessage } from '@/form/FieldError';

import { TableProps } from './types';

interface TableControlHeadProps {
  fieldType?: TableProps['fieldType'];
  enableMultiSelect?: boolean;
  rows: any[];
  selectedRows?: any[];
  onSelectAllRows?: (rows: any[]) => void;
}

export const TableControlHead: FC<TableControlHeadProps> = ({
  fieldType,
  enableMultiSelect,
  rows,
  selectedRows,
  onSelectAllRows,
}) => {
  const isAllSelected = selectedRows?.length >= rows?.length;
  const refCheck = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (refCheck.current) {
      refCheck.current.indeterminate =
        !isAllSelected && Boolean(selectedRows?.length);
    }
  }, [isAllSelected, selectedRows]);

  if (fieldType) {
    return (
      <th className="h-[44px] w-2.5 py-0 ps-[var(--table-edge-px,16px)] pe-0 align-middle print:hidden" />
    );
  }

  if (!enableMultiSelect) {
    return null;
  }

  return (
    <th className="h-[44px] w-2.5 py-0 ps-[var(--table-edge-px,16px)] pe-0 align-middle print:hidden">
      <Checkbox
        ref={refCheck}
        data-testid="select-all"
        aria-label={translate('Select all rows')}
        checked={isAllSelected}
        onChange={() => onSelectAllRows?.(rows)}
      />
    </th>
  );
};

interface TableControlCellProps {
  fieldType?: TableProps['fieldType'];
  fieldProps?: { input: any; meta: any };
  rowError?: string | string[];
  isChecked: boolean;
  onFieldChange: () => void;
  onSelectRow: () => void;
}

export const TableControlCell: FC<TableControlCellProps> = ({
  fieldType,
  fieldProps,
  rowError,
  isChecked,
  onFieldChange,
  onSelectRow,
}) => {
  const hasErrorMark = Boolean(
    fieldType &&
    fieldProps &&
    (rowError ||
      (isChecked && fieldProps.meta.touched && fieldProps.meta.error)),
  );

  return (
    <td
      data-slot="row-control"
      className="h-[44px] py-0 ps-[var(--table-edge-px,16px)] pe-0 align-middle text-quaternary print:hidden"
    >
      <div
        className={classNames(
          'flex items-center',
          hasErrorMark && '[&>span:has(>input)]:ml-[6px]',
        )}
      >
        {fieldType && fieldProps ? (
          <>
            {rowError ? (
              <Tooltip label={<FieldErrorMessage error={rowError} />}>
                <WarningCircleIcon
                  weight="bold"
                  size={16}
                  className="absolute left-0 leading-none text-[var(--color-warning-600)] dark:text-[var(--color-error-300)]"
                />
              </Tooltip>
            ) : (
              isChecked &&
              fieldProps.meta.touched &&
              fieldProps.meta.error && (
                <Tooltip label={fieldProps.meta.error}>
                  <WarningCircleIcon
                    weight="bold"
                    size={16}
                    className="absolute left-0 leading-none text-[var(--color-warning-600)] dark:text-[var(--color-error-300)]"
                  />
                </Tooltip>
              )
            )}
            {fieldType === 'radio' ? (
              <Radio
                name={fieldProps.input.name}
                aria-label={translate('Select row')}
                checked={isChecked}
                onChange={onFieldChange}
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
              />
            ) : (
              <Checkbox
                name={fieldProps.input.name}
                aria-label={translate('Select row')}
                checked={isChecked}
                onChange={onFieldChange}
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
              />
            )}
          </>
        ) : (
          <Checkbox
            aria-label={translate('Select row')}
            checked={isChecked}
            onChange={onSelectRow}
          />
        )}
      </div>
    </td>
  );
};
