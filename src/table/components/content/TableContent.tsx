import { ErrorBoundary } from '@sentry/react';
import classNames from 'classnames';
import { useMemo } from 'react';

import { LoadingSpinnerSimple } from '@/core/LoadingSpinner';
import { ErrorMessage } from '@/ErrorMessage';
import { ErrorView } from '@/ErrorView';

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
      <h1 className="text-center" data-testid="table-content-loading">
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
    <div className="absolute inset-0 z-10 flex items-center justify-center">
      <h1 className="mb-0">
        <LoadingSpinnerSimple />
      </h1>
    </div>
  ) : null;

  // While refetching, aria-busy dims the current rows and blocks clicks on them.
  const containerProps = {
    'aria-busy': isRefetching || undefined,
    'data-testid': 'table-container',
  };
  const containerClassName =
    'table-container transition-opacity duration-150 aria-busy:pointer-events-none aria-busy:opacity-50';

  // Render grid mode
  if (mode === 'grid' && slots.gridItem) {
    return (
      <ErrorBoundary fallback={ErrorMessage}>
        {refetchOverlay}
        <div
          className={classNames(
            containerClassName,
            gridHover && 'grid-hover-shadow',
          )}
          {...containerProps}
        >
          <GridBody
            rows={rows}
            gridItem={slots.gridItem}
            gridClassName={display.gridClassName}
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
          containerClassName,
          tableHover && 'table-hover-shadow',
        )}
        {...containerProps}
      >
        <TableView />
      </div>
    </ErrorBoundary>
  );
}
