import { ErrorBoundary } from '@sentry/react';
import classNames from 'classnames';
import { useMemo } from 'react';

import { LoadingSpinnerIcon } from '@waldur/core/LoadingSpinner';
import { ErrorMessage } from '@waldur/ErrorMessage';
import { ErrorView } from '@waldur/ErrorView';

import { useTableContext } from '../../context';
import { GridBody } from '../../GridBody';
import { TableLoadingSpinnerContainer } from '../../TableLoadingSpinnerContainer';
import { TablePlaceholder } from '../../TablePlaceholder';

import { TableView } from './TableView';

/**
 * Renders the table content based on current state.
 * Handles loading, error, empty, and data states.
 * Switches between table and grid modes.
 *
 * @internal
 */
export function TableContent() {
  const {
    rows,
    loading,
    error,
    mode,
    query,
    hasRows,
    config,
    actions,
    slots,
    display,
    filtersStorage,
  } = useTableContext();

  const isRefetching = loading && hasRows;

  const tableHover = useMemo(
    () =>
      typeof config.hoverShadow === 'object'
        ? (config.hoverShadow.table ?? true)
        : config.hoverShadow,
    [config.hoverShadow],
  );

  const gridHover = useMemo(
    () =>
      (typeof config.hoverShadow === 'object'
        ? (config.hoverShadow.grid ?? true)
        : config.hoverShadow) && Boolean(slots.gridItem),
    [config.hoverShadow, slots.gridItem],
  );

  // Render loading state
  if (loading && !hasRows) {
    return (
      <h1 className="text-center">
        <TableLoadingSpinnerContainer loading={loading} />
      </h1>
    );
  }

  // Render error state
  if (error) {
    return <ErrorView error={error} />;
  }

  // Render empty state
  if (!loading && !hasRows) {
    if (slots.placeholderComponent) {
      return <>{slots.placeholderComponent}</>;
    }
    return (
      <TablePlaceholder
        query={query}
        filtersStorage={filtersStorage}
        verboseName={display.verboseName}
        emptyMessage={display.emptyMessage}
        clearSearch={() => actions.setQuery('')}
        fetch={actions.fetch}
        hasRetry={config.placeholderHasRetry}
        actions={slots.placeholderActions}
      />
    );
  }

  // Refetch loading overlay
  const refetchOverlay = isRefetching ? (
    <div className="table-loading-overlay">
      <h1 className="mb-0">
        <LoadingSpinnerIcon />
      </h1>
    </div>
  ) : null;

  // Render grid mode
  if (mode === 'grid' && slots.gridItem) {
    return (
      <ErrorBoundary fallback={ErrorMessage}>
        {refetchOverlay}
        <div
          className={classNames(
            'table-container',
            gridHover && 'grid-hover-shadow',
            isRefetching && 'table-content-refetching',
          )}
        >
          <GridBody
            rows={rows}
            gridItem={slots.gridItem}
            gridSize={display.gridSize}
            gridSpace={display.gridSpace}
            gridFixedWidth={display.gridFixedWidth}
          />
        </div>
      </ErrorBoundary>
    );
  }

  // Render table mode
  return (
    <ErrorBoundary fallback={ErrorMessage}>
      {refetchOverlay}
      <div
        className={classNames(
          'table-container',
          tableHover && 'table-hover-shadow',
          isRefetching && 'table-content-refetching',
        )}
      >
        <TableView />
      </div>
    </ErrorBoundary>
  );
}
