import { XIcon } from '@phosphor-icons/react';
import classNames from 'classnames';
import { createElement, useCallback } from 'react';

import { translate } from 'waldur-i18n-runtime';
import { BaseButton, useBreakpointDown } from 'waldur-ui';

import { titleCase } from '@/core/utils';

import { useTableContext } from '../../context';
import { TableButtons } from '../../TableButtons';
import { TableFilterButton } from '../../TableFilterButton';
import { TableQuery } from '../../TableQuery';
import { TableRefreshButton } from '../../TableRefreshButton';

/**
 * Renders the table actions section (multi-select, query, action buttons).
 * Used within the Card.Header toolbar area.
 *
 * @internal
 */
export function TableToolbarActions() {
  const {
    config,
    actions,
    query,
    slots,
    selectedRows,
    showTitle,
    showActionsColumn,
    showFilterMenuToggle,
    loading,
    portal,
    // Pass through all props needed by TableButtons
    rows,
    columns,
    activeColumns,
    columnPositions,
    mode,
    filter,
    filterPosition,
    filtersStorage,
  } = useTableContext();

  const isSm = useBreakpointDown('sm');

  // Handler for filter button click
  const onClickFilterButton = useCallback(
    (event: React.MouseEvent) => {
      if (filterPosition === 'sidebar') {
        actions.openFiltersDrawer(slots.filters, config.formId);
      } else {
        // Force `true`, not a bare toggle: when filters are already active,
        // Table.tsx's mount effect has already flipped showFilterMenuToggle
        // true, so a plain flip here would set it back to false — hiding
        // (`d-none`, Table.tsx's Card.Header) the very container holding
        // the real Add-filter trigger this handler is about to
        // programmatically click below, in the same React batch. With the
        // trigger's ancestor display:none at the moment floating-ui reads
        // its bounding rect, the popup anchors at getBoundingClientRect()'s
        // all-zero fallback — the viewport origin — reported live as the
        // filter dropdown rendering over the sidebar nav instead of next to
        // the funnel button, specifically when filters were already set.
        actions.toggleFilterMenu(true);
        const parent: HTMLElement = event.currentTarget.closest('.card-table');
        if (!parent) return;
        const addFilterButton =
          parent.querySelector<HTMLButtonElement>('[data-add-filter]');
        if (addFilterButton) {
          if (!showFilterMenuToggle || filtersStorage?.length) {
            addFilterButton.click();
            event.stopPropagation();
          }
        }
      }
    },
    [
      actions,
      slots.filters,
      filterPosition,
      showFilterMenuToggle,
      filtersStorage,
    ],
  );

  // Check if filter button should be shown next to search
  const showFilterButtonNextToSearch =
    !isSm && ['menu', 'sidebar'].includes(filterPosition) && slots.filters;

  return (
    <>
      {/* Multi-select actions */}
      {selectedRows?.length > 0 && slots.multiSelectActions && (
        <div className="order-1 order-sm-1 flex justify-start flex-wrap text-nowrap gap-3">
          <div className="flex items-center font-normal text-primary me-1.5">
            <BaseButton
              iconNode={<XIcon weight="bold" />}
              tooltip={translate('Clear selection')}
              onClick={actions.resetSelection}
              variant="text-secondary"
              className="me-1"
              size="sm"
            />
            <span>
              ({selectedRows?.length}) {translate('Selected')}
            </span>
          </div>
          {createElement(slots.multiSelectActions, {
            rows: selectedRows,
            refetch: () => {
              actions.fetch();
              actions.resetSelection();
            },
          })}
        </div>
      )}

      {/* Right side: search, filters and table actions */}
      {(config.hasQuery || showActionsColumn) && (
        <div
          className={classNames(
            'grow order-2 order-sm-2 flex items-center',
            // In a tabbed card's header the toolbar shares the width with the
            // card title; let search and buttons wrap instead of overflowing.
            // Bootstrap's .flex-wrap is !important and would beat a Tailwind
            // sm:flex-nowrap, so wrap only below sm for a standalone table.
            portal?.toolbar ? 'flex-wrap' : 'max-sm:flex-wrap',
            'text-nowrap gap-3',
            showTitle ? 'ms-auto justify-end' : 'justify-between',
          )}
        >
          {config.hasQuery && (
            <div className="flex items-center gap-3">
              <div className="table-toolbar-search">
                <TableQuery
                  query={query}
                  setQuery={actions.setQuery}
                  inputClassName="h-11"
                />
              </div>
              {config.hideTitle && !config.hideRefresh && !portal?.refresh && (
                <TableRefreshButton fetch={actions.fetch} loading={loading} />
              )}
              {/* Filter button next to search (only on larger screens) */}
              {showFilterButtonNextToSearch && (
                <TableFilterButton
                  onClick={onClickFilterButton}
                  hasFilter={!!filtersStorage?.length}
                  filterCount={filtersStorage?.length || 0}
                />
              )}
            </div>
          )}

          {showActionsColumn && (
            <div className="flex sm:justify-end max-sm:flex-wrap text-nowrap gap-3">
              <TableButtons
                table={config.table}
                rows={rows}
                columns={columns}
                activeColumns={activeColumns}
                columnPositions={columnPositions}
                toggleColumn={actions.toggleColumn}
                swapColumns={actions.swapColumns}
                initColumnPositions={actions.initColumnPositions}
                resetColumns={actions.resetColumns}
                hasOptionalColumns={config.hasOptionalColumns}
                enableExport={config.enableExport}
                fullExport={config.fullExport}
                showExportInDropdown={config.showExportInDropdown}
                gridItem={slots.gridItem}
                mode={mode}
                setDisplayMode={actions.setDisplayMode}
                filter={filter}
                filters={slots.filters}
                formId={config.formId}
                filterPosition={filterPosition}
                filtersStorage={filtersStorage}
                setFilter={actions.setFilter}
                applyFiltersFn={actions.applyFiltersFn}
                renderFiltersDrawer={actions.renderFiltersDrawer}
                openFiltersDrawer={actions.openFiltersDrawer}
                showFilterMenuToggle={showFilterMenuToggle}
                toggleFilterMenu={actions.toggleFilterMenu}
                tableActions={slots.tableActions}
                dropdownActions={slots.dropdownActions}
                enableMultiSelect={config.enableMultiSelect}
                multiSelectActions={slots.multiSelectActions}
                fetch={actions.fetch}
                standalone={config.standalone}
                standaloneActionsInTable={config.standaloneActionsInTable}
                renderFilterButton={isSm || !config.hasQuery}
              />
            </div>
          )}
        </div>
      )}
    </>
  );
}

/**
 * Renders the table title section.
 *
 * @internal
 */
export function TableToolbarTitle() {
  const { config, actions, display, showTitle, portal, loading } =
    useTableContext();

  if (!showTitle) {
    return null;
  }

  return (
    <div className="grow order-0" data-testid="table-toolbar-title-container">
      <div className="card-title h5">
        {!config.hideTitle && (
          <div className="me-1.5">
            <span className={classNames('h3', display.titleClassName)}>
              {display.title ||
                display.alterTitle ||
                (display.verboseName && titleCase(display.verboseName))}
            </span>
            {Boolean(display.subtitle) && (
              <small className="text-sm font-normal block mt-1">
                {display.subtitle}
              </small>
            )}
          </div>
        )}
        {!config.hideRefresh && !portal?.refresh && (
          <TableRefreshButton fetch={actions.fetch} loading={loading} />
        )}
      </div>
    </div>
  );
}

/**
 * Main table toolbar component.
 * Renders the complete Card.Header with title and actions.
 *
 * @internal
 */
export function TableToolbar() {
  const { config, display, portal } = useTableContext();

  if (!config.hasActionBar) {
    return null;
  }

  return (
    <div
      className={classNames(
        'border-b-[1px] border-b-secondary',
        display.headerClassName,
        'card-header',
      )}
      data-testid="table-toolbar"
    >
      <div className="card-toolbar flex flex-wrap items-center gap-3 w-full">
        <TableToolbarTitle />
        {!portal?.toolbar && <TableToolbarActions />}
      </div>
    </div>
  );
}
