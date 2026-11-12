import { ErrorBoundary } from '@sentry/react';
import classNames from 'classnames';
import { useCallback, useMemo } from 'react';
import { ErrorView } from 'waldur-ui';

import { useTableContext } from '../../context';
import { GridBody } from '../../GridBody';
import { getTableHost } from '../../host';
import {
  GRID_HOVER_SHADOW_CLASS,
  TABLE_HOVER_SHADOW_CLASS,
} from '../../styles';
import {
  TableLoadingSpinnerContainer,
  TableSpinner,
} from '../../TableLoadingSpinnerContainer';
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
  const { ErrorFallback } = getTableHost();

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

  const content = (
    <>
      {/* Refetch loading overlay */}
      {isRefetching && (
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <h1 className="mb-0">
            <TableSpinner />
          </h1>
        </div>
      )}
      <div
        className={classNames(
          'w-full min-w-0',
          mode === 'grid' && 'overflow-x-hidden',
          REFETCH_CLASSES,
          isGrid
            ? gridHover && GRID_HOVER_SHADOW_CLASS
            : tableHover && TABLE_HOVER_SHADOW_CLASS,
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
    </>
  );

  // A crash while drawing the rows stays inside the table when the host has
  // a message for it; otherwise it is the app's boundary that catches it.
  return ErrorFallback ? (
    <ErrorBoundary fallback={ErrorFallback}>{content}</ErrorBoundary>
  ) : (
    content
  );
}
