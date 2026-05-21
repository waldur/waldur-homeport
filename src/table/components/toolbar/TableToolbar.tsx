import { XIcon } from '@phosphor-icons/react';
import classNames from 'classnames';
import { createElement, useCallback } from 'react';
import { Card, Col, Row, Stack } from 'react-bootstrap';
import { useMediaQuery } from 'react-responsive';

import { CompactIconButton } from '@/core/buttons/IconButton';
import { GRID_BREAKPOINTS } from '@/core/constants';
import { titleCase } from '@/core/utils';
import { translate } from '@/i18n';

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

  const isSm = useMediaQuery({ maxWidth: GRID_BREAKPOINTS.sm });

  // Handler for filter button click
  const onClickFilterButton = useCallback(
    (event: React.MouseEvent) => {
      if (filterPosition === 'sidebar') {
        actions.openFiltersDrawer(slots.filters, config.formId);
      } else {
        actions.toggleFilterMenu();
        const parent: HTMLElement = event.currentTarget.closest('.card-table');
        if (!parent) return;
        const btns = parent.getElementsByClassName(
          'btn-add-filter',
        ) as HTMLCollectionOf<HTMLButtonElement>;
        if (btns?.length) {
          if (!showFilterMenuToggle || filtersStorage?.length) {
            btns.item(0).click();
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
        <Col
          xs="auto"
          className="order-1 order-sm-1 d-flex justify-content-start flex-wrap text-nowrap gap-4"
        >
          <Stack direction="horizontal" className="fw-normal text-dark me-2">
            <CompactIconButton
              iconNode={<XIcon weight="bold" />}
              tooltip={translate('Clear selection')}
              onClick={actions.resetSelection}
              variant="text-secondary"
              className="me-1"
            />
            <span>
              ({selectedRows?.length}) {translate('Selected')}
            </span>
          </Stack>
          {createElement(slots.multiSelectActions, {
            rows: selectedRows,
            refetch: () => {
              actions.fetch();
              actions.resetSelection();
            },
          })}
        </Col>
      )}

      {/* Right side: search, filters and table actions */}
      {(config.hasQuery || showActionsColumn) && (
        <Col
          xs
          className={classNames(
            'order-2 order-sm-2 d-flex align-items-center flex-wrap flex-sm-nowrap text-nowrap gap-4',
            showTitle
              ? 'ms-auto justify-content-end'
              : 'justify-content-between',
          )}
        >
          {config.hasQuery && (
            <div className="d-flex align-items-center gap-4">
              <div className="table-toolbar-search">
                <TableQuery query={query} setQuery={actions.setQuery} />
              </div>
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
            <div className="d-flex justify-content-sm-end flex-wrap flex-sm-nowrap text-nowrap gap-4">
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
                showExportInDropdown={config.showExportInDropdown}
                gridItem={slots.gridItem}
                mode={mode}
                setDisplayMode={actions.setDisplayMode}
                filter={filter}
                filters={slots.filters}
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
        </Col>
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
    <Col xs className="order-0">
      <Card.Title>
        {!config.hideTitle && (
          <div className="me-2">
            <span className={classNames('h3', display.titleClassName)}>
              {display.title ||
                display.alterTitle ||
                (display.verboseName && titleCase(display.verboseName))}
            </span>
            {Boolean(display.subtitle) && (
              <small className="fs-6 fw-normal d-block mt-4px">
                {display.subtitle}
              </small>
            )}
          </div>
        )}
        {!config.hideRefresh && !portal?.refresh && (
          <TableRefreshButton fetch={actions.fetch} loading={loading} />
        )}
      </Card.Title>
    </Col>
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
    <Card.Header
      className={classNames('border-bottom', display.headerClassName)}
    >
      <Row className="card-toolbar g-0 gap-4 w-100">
        <TableToolbarTitle />
        {!portal?.toolbar && <TableToolbarActions />}
      </Row>
    </Card.Header>
  );
}
