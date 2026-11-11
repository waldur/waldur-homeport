import { PushPinIcon } from '@phosphor-icons/react';
import classNames from 'classnames';
import React, { FC, useEffect, useRef } from 'react';

import { translate } from 'waldur-i18n-runtime';
import { Tooltip } from 'waldur-ui';

import {
  CaretDownSmallIcon,
  CaretUpSmallIcon,
} from '@/core/CaretUpDownButtons';

import { getPinnedCellClasses, HEADER_CONTROL_BTN_CLASS } from './styles';
import { TableHeaderExpander } from './TableExpandable';
import { TableFiltersMenu } from './TableFiltersMenu';
import { Column, Sorting, TableProps } from './types';

const getSortMode = (column: Column, sorting?: Sorting) =>
  column.orderField && sorting && column.orderField === sorting.field
    ? sorting.mode
    : undefined;

const SortToggle: FC<{
  column: Column;
  sorting: Sorting;
  sort?: (sorting: Sorting) => void;
  hasFilter?: boolean;
}> = ({ column, sorting, sort, hasFilter }) => {
  const mode = getSortMode(column, sorting);
  const previousMode = useRef(mode);
  const wasSorted = previousMode.current !== undefined;
  useEffect(() => {
    previousMode.current = mode;
  }, [mode]);

  const onClick = () =>
    mode === 'asc'
      ? sort?.({ field: column.orderField!, mode: 'desc' })
      : mode === 'desc'
        ? sort?.({ field: null, mode: undefined })
        : sort?.({ field: column.orderField!, mode: 'asc' });

  const name =
    typeof column.title === 'string' ? column.title : column.orderField;
  const label =
    mode === 'asc'
      ? translate('{name}: sorted ascending. Sort descending', { name })
      : mode === 'desc'
        ? translate('{name}: sorted descending. Clear sorting', { name })
        : translate('{name}: not sorted. Sort ascending', { name });
  const announcement =
    mode === 'asc'
      ? translate('Sorted by {name}, ascending', { name })
      : mode === 'desc'
        ? translate('Sorted by {name}, descending', { name })
        : wasSorted
          ? translate('Sorting by {name} cleared', { name })
          : '';

  return (
    <>
      <button
        type="button"
        className={classNames(
          HEADER_CONTROL_BTN_CLASS,
          'inline-flex flex-col items-center align-middle',
          hasFilter && 'mr-0!',
        )}
        data-testid="sort-toggle"
        aria-label={label}
        onClick={onClick}
      >
        <CaretUpSmallIcon
          className={
            mode === 'asc' ? 'text-[var(--fg-brand-primary)]!' : undefined
          }
        />
        <CaretDownSmallIcon
          className={
            mode === 'desc' ? 'text-[var(--fg-brand-primary)]!' : undefined
          }
        />
      </button>
      <span className="sr-only" aria-live="polite">
        {announcement}
      </span>
    </>
  );
};

export interface TableHeaderCellProps {
  column: Column;
  onSortClick?: (sorting: Sorting) => void;
  currentSorting?: Sorting;
  filters?: TableProps['filters'];
  filtersStorage?: TableProps['filtersStorage'];
  setFilter?: TableProps['setFilter'];
  applyFiltersFn?: TableProps['applyFiltersFn'];
  toggleFilterMenu: (show?: boolean) => void;
  isFirstDataColumn?: boolean;
  expandableRow?: boolean;
  hideExpandToggle?: boolean;
  toggledAll?: boolean;
  toggleAll: () => void;
  hasLeadingCheckbox?: boolean;
  pinKey: string;
  pinned?: boolean;
  shadow?: boolean | 'start' | 'end';
  pinOffset?: { left: number; right: number };
  onTogglePin?: (id: string) => void;
}

export const TableHeaderCell: FC<TableHeaderCellProps> = ({
  column,
  onSortClick,
  currentSorting,
  filters,
  filtersStorage,
  setFilter,
  applyFiltersFn,
  toggleFilterMenu,
  isFirstDataColumn,
  expandableRow,
  hideExpandToggle,
  toggledAll = false,
  toggleAll,
  hasLeadingCheckbox,
  pinKey,
  pinned,
  shadow,
  pinOffset,
  onTogglePin,
}) => {
  const isFirstExpandable = Boolean(isFirstDataColumn && expandableRow);
  const hasFilter = Boolean(column.filter && filters);
  const sortMode = getSortMode(column, currentSorting);

  const mainInner = (
    <>
      <span
        className={
          isFirstExpandable
            ? classNames(
                'inline-flex items-center align-middle',
                hasLeadingCheckbox ? 'ps-3' : 'ps-4',
              )
            : 'align-middle'
        }
      >
        {isFirstExpandable && !hideExpandToggle && (
          <TableHeaderExpander
            toggledAll={toggledAll}
            onToggleAll={toggleAll}
          />
        )}
        {column.title}
        {column.orderField && currentSorting ? (
          <SortToggle
            column={column}
            sorting={currentSorting}
            sort={onSortClick}
            hasFilter={hasFilter}
          />
        ) : null}
      </span>
      {hasFilter && (
        <TableFiltersMenu
          filters={filters}
          filterPosition="menu"
          filtersStorage={filtersStorage}
          setFilter={setFilter}
          applyFiltersFn={applyFiltersFn}
          openName={column.filter}
          toggleFilterMenu={toggleFilterMenu}
        />
      )}
    </>
  );

  return (
    <th
      scope="col"
      className={classNames(
        'h-[44px] py-0 align-middle text-xs font-medium text-quaternary whitespace-nowrap [&_svg]:text-quinary',
        isFirstExpandable
          ? 'px-0!'
          : 'px-2 first:ps-[var(--table-edge-px,9.75px)] last:pe-[var(--table-edge-px,9.75px)]',
        column.headerClassName,
        getPinnedCellClasses(pinned, shadow),
      )}
      style={
        pinned && pinOffset
          ? { left: pinOffset.left, right: pinOffset.right }
          : undefined
      }
      data-pin-key={pinKey}
      aria-sort={
        sortMode === 'asc'
          ? 'ascending'
          : sortMode === 'desc'
            ? 'descending'
            : undefined
      }
    >
      <div
        className={classNames(
          'flex items-center justify-start gap-x-1',
          isFirstExpandable && 'pe-4',
        )}
      >
        <div className="flex items-center min-w-0">
          {column.meta ? (
            <div className="flex items-center">
              {mainInner}
              {column.meta}
            </div>
          ) : (
            mainInner
          )}
        </div>
        {onTogglePin && (
          <button
            type="button"
            className={classNames(
              HEADER_CONTROL_BTN_CLASS,
              'inline-flex items-center shrink-0 aria-pressed:[&_svg]:text-[var(--fg-brand-primary)]',
            )}
            data-testid={`pin-toggle-${pinKey}`}
            aria-pressed={Boolean(pinned)}
            aria-label={
              pinned ? translate('Unpin column') : translate('Pin column')
            }
            onClick={() => onTogglePin(pinKey)}
          >
            <Tooltip
              label={
                pinned ? translate('Unpin column') : translate('Pin column')
              }
            >
              <PushPinIcon size={16} weight={pinned ? 'fill' : 'bold'} />
            </Tooltip>
          </button>
        )}
      </div>
    </th>
  );
};
