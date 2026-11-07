import { ErrorBoundary } from '@sentry/react';
import classNames from 'classnames';
import { useCallback, useMemo } from 'react';

import { LoadingSpinnerSimple } from '@/core/LoadingSpinner';
import { ErrorMessage } from '@/ErrorMessage';
import { ErrorView } from '@/ErrorView';

import { useTableContext } from '../../context';
import { GridBody } from '../../GridBody';
import { TableLoadingSpinnerContainer } from '../../TableLoadingSpinnerContainer';
import { TablePlaceholder } from '../../TablePlaceholder';

import { TableView } from './TableView';

// A background refetch dims the rows on screen until fresh data arrives.
const REFETCH_CLASSES = 'transition-opacity duration-150 aria-busy:opacity-50';

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

  // The stale rows also take no input while refetching: `inert` blocks
  // keyboard focus as well as clicks, so nobody acts on a row about to be
  // replaced. React 18 has no `inert` prop, so the ref sets the property.
  const setInert = useCallback(
    (element: HTMLDivElement | null) => {
      if (element) element.inert = isRefetching;
    },
    [isRefetching],
  );

  const tableHover = useMemo(
    () =>
      typeof config.hoverShadow === 'object'
        ? (config.hoverShadow.table ?? true)
        : config.hoverShadow,
    [config.hoverShadow],
  );

  const gridHover = useMemo(
    () =>
      typeof config.hoverShadow === 'object'
        ? (config.hoverShadow.grid ?? true)
        : config.hoverShadow,
    [config.hoverShadow],
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

  const isGrid = mode === 'grid' && Boolean(slots.gridItem);

  return (
    <ErrorBoundary fallback={ErrorMessage}>
      {/* Refetch loading overlay */}
      {isRefetching && (
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <h1 className="mb-0">
            <LoadingSpinnerSimple />
          </h1>
        </div>
      )}
      <div
        className={classNames(
          'table-container',
          REFETCH_CLASSES,
          isGrid
            ? gridHover && 'grid-hover-shadow'
            : tableHover && 'table-hover-shadow',
        )}
        ref={setInert}
        aria-busy={isRefetching || undefined}
        data-testid="table-container"
      >
        {isGrid ? (
          <GridBody
            rows={rows}
            gridItem={slots.gridItem}
            gridClassName={display.gridClassName}
            gridFixedWidth={display.gridFixedWidth}
          />
        ) : (
          <TableView />
        )}
      </div>
    </ErrorBoundary>
  );
}
