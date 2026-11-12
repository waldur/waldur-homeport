import { FunnelSimpleIcon, SquareLogoIcon } from '@phosphor-icons/react';
import classNames from 'classnames';
import React, { memo, useCallback, useState } from 'react';
import { translate } from 'waldur-i18n-runtime';
import { BaseButton, CopyToClipboardButton, MenuPopover } from 'waldur-ui';

import { TableFilterContext } from './FilterContextProvider';
import { getPinnedCellClasses } from './styles';
import { RowExpander, TableRowExpander } from './TableExpandable';
import { Column } from './types';

const InlineFilterButton = memo(({ column, row }: { column: Column; row }) => {
  const { filterComponents, apply, changeFilterValue } =
    React.useContext(TableFilterContext);
  const [open, setOpen] = useState(false);

  const callback = useCallback(() => {
    const filterConfig = filterComponents.find(
      (comp) => comp.name === column.filter,
    );
    const value = column.inlineFilter(row);
    filterConfig.setFilter(value);
    changeFilterValue(column.filter, value);
    apply();
    setOpen(false);
  }, [filterComponents, column, row, changeFilterValue, apply]);

  return (
    <span
      data-slot="inline-filter-anchor"
      className="absolute right-[9.75px] top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-secondary opacity-0 transition-opacity duration-150 ease-linear group-hover/row:opacity-100 has-[button:focus-visible]:opacity-100"
    >
      <MenuPopover open={open} onOpenChange={setOpen} modal={false}>
        <MenuPopover.Trigger asChild>
          <BaseButton
            variant="text-secondary"
            size="sm"
            data-slot="inline-filter"
            data-testid="inline-filter"
            className="[&_svg]:-mt-0.75 [&_svg]:text-tertiary hover:[&_svg]:text-secondary"
            tooltip={translate('Add filter')}
            iconNode={<FunnelSimpleIcon weight="bold" size={20} />}
          />
        </MenuPopover.Trigger>
        <MenuPopover.Content
          align="start"
          className="w-auto min-w-[150px] py-1 font-medium"
        >
          <MenuPopover.Item
            className="px-[16.25px] py-[9.75px]"
            onClick={callback}
          >
            <span className="me-[13px] flex shrink-0 items-center">
              <SquareLogoIcon weight="bold" size={20} />
            </span>
            {translate('Filter by')}
          </MenuPopover.Item>
        </MenuPopover.Content>
      </MenuPopover>
    </span>
  );
});

InlineFilterButton.displayName = 'InlineFilterButton';

const hasFilterMenu = (key: string) => {
  const item = document.querySelector(
    '#kt_content_container [data-slot="table-filters-menu"] #filter-item-' +
      key,
  );
  return Boolean(item);
};

const showTruncationTooltip = (e: React.MouseEvent<HTMLTableCellElement>) => {
  const td = e.currentTarget;
  const inner = td.querySelector(
    '[data-slot="cell-data"]',
  ) as HTMLElement | null;
  const source = inner ?? td;
  if (source.scrollWidth > source.clientWidth + 1) {
    const text = (source.innerText || '').trim();
    if (text && td.getAttribute('title') !== text) {
      td.setAttribute('title', text);
    }
  } else if (td.hasAttribute('title')) {
    td.removeAttribute('title');
  }
};

export interface TableDataCellProps {
  column: Column;
  row: any;
  isFirstColumn?: boolean;
  expander?: RowExpander;
  hasLeadingCheckbox?: boolean;
  pinned?: boolean;
  shadow?: boolean | 'start' | 'end';
  pinOffset?: { left: number; right: number };
}

export const TableDataCell = memo(
  ({
    column,
    row,
    isFirstColumn,
    expander,
    hasLeadingCheckbox,
    pinned,
    shadow,
    pinOffset,
  }: TableDataCellProps) => {
    const labelId = expander ? `${expander.detailsId}-label` : undefined;
    const toggleTextId = expander ? `${expander.detailsId}-toggle` : undefined;

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
    const hasFilter = Boolean(
      column.inlineFilter && hasFilterMenu(column.filter),
    );
    const isFilterableColumn = Boolean(column.inlineFilter);

    const ellipsisEnabled = column.ellipsis ?? true;
    const isFirstExpandable = Boolean(isFirstColumn && expander);

    const cellClassName = classNames(
      'group/cell h-[44px] py-0 align-middle text-quaternary [&>*]:align-middle',
      isFirstExpandable
        ? 'px-0'
        : 'px-2 first:ps-[var(--table-edge-px,9.75px)] last:pe-[var(--table-edge-px,9.75px)]',
      column.rowHeader && 'font-normal text-start',
      !pinned && isFilterableColumn && 'relative',
      ellipsisEnabled &&
        'max-w-[300px] overflow-x-hidden text-ellipsis whitespace-nowrap [&>*]:overflow-x-hidden [&>*]:text-ellipsis [&>*]:whitespace-nowrap',
      getPinnedCellClasses(pinned, shadow),
      column.className,
    );

    const pinStyle =
      pinned && pinOffset
        ? { left: pinOffset.left, right: pinOffset.right }
        : undefined;
    const onCellMouseEnter = ellipsisEnabled
      ? showTruncationTooltip
      : undefined;

    const hasCopy =
      Boolean(column.copyField) && valueToCopy !== '' && valueToCopy != null;
    const hasExpander = isFirstColumn && expander?.canExpand;
    const dataId = hasExpander && (hasCopy || hasFilter) ? labelId : undefined;

    const ellipsisInnerClasses =
      ellipsisEnabled &&
      'overflow-x-hidden text-ellipsis whitespace-nowrap [&>*]:overflow-x-hidden [&>*]:text-ellipsis [&>*]:whitespace-nowrap';

    const content = hasCopy ? (
      <>
        <div
          className={classNames(
            'flex items-center gap-1',
            isFilterableColumn &&
              'group-hover/row:w-[calc(100%-40px)] group-has-[[data-slot=inline-filter]:focus-visible]/cell:w-[calc(100%-40px)]',
          )}
        >
          <div
            data-slot="cell-data"
            id={dataId}
            className={classNames('[&>*]:align-middle', ellipsisInnerClasses)}
          >
            {renderedContent}
          </div>
          <CopyToClipboardButton value={valueToCopy} />
        </div>
        {hasFilter && <InlineFilterButton column={column} row={row} />}
      </>
    ) : (
      <>
        {hasFilter ? (
          <div
            data-slot="cell-data"
            id={dataId}
            className={classNames(
              '[&>*]:align-middle',
              ellipsisInnerClasses,
              'group-hover/row:w-[calc(100%-40px)] group-hover/row:overflow-x-hidden group-hover/row:text-ellipsis group-hover/row:whitespace-nowrap',
              'group-has-[[data-slot=inline-filter]:focus-visible]/cell:w-[calc(100%-40px)] group-has-[[data-slot=inline-filter]:focus-visible]/cell:overflow-x-hidden group-has-[[data-slot=inline-filter]:focus-visible]/cell:text-ellipsis group-has-[[data-slot=inline-filter]:focus-visible]/cell:whitespace-nowrap',
            )}
          >
            {renderedContent}
          </div>
        ) : (
          renderedContent
        )}
        {hasFilter && <InlineFilterButton column={column} row={row} />}
      </>
    );

    const handleClick = column.disabledClick
      ? (e: React.MouseEvent) => e.stopPropagation()
      : undefined;

    const Cell = column.rowHeader ? 'th' : 'td';
    const scope = column.rowHeader ? 'row' : undefined;

    if (isFirstExpandable && expander) {
      return (
        <Cell
          scope={scope}
          className={cellClassName}
          onClick={handleClick}
          onMouseEnter={onCellMouseEnter}
          style={pinStyle}
        >
          <div
            className={classNames(
              'flex items-center pe-4 gap-x-3',
              hasLeadingCheckbox ? 'ps-3' : 'ps-4',
            )}
          >
            {expander.canExpand && (
              <TableRowExpander
                expander={expander}
                toggleTextId={toggleTextId}
                labelId={labelId}
              />
            )}
            <div
              id={hasExpander && !dataId ? labelId : undefined}
              className={classNames('flex-auto min-w-0', ellipsisInnerClasses)}
            >
              {content}
            </div>
          </div>
        </Cell>
      );
    }

    return (
      <Cell
        scope={scope}
        className={cellClassName}
        onClick={handleClick}
        onMouseEnter={onCellMouseEnter}
        style={pinStyle}
      >
        {content}
      </Cell>
    );
  },
);

TableDataCell.displayName = 'TableDataCell';
