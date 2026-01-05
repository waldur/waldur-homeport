import { ErrorBoundary } from '@sentry/react';
import classNames from 'classnames';
import { useMemo } from 'react';

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

  // Render grid mode
  if (mode === 'grid' && slots.gridItem) {
    return (
      <ErrorBoundary fallback={ErrorMessage}>
        <div
          className={classNames(
            'table-container',
            gridHover && 'grid-hover-shadow',
          )}
        >
          <GridBody
            rows={rows}
            gridItem={slots.gridItem}
            gridSize={display.gridSize}
          />
        </div>
      </ErrorBoundary>
    );
  }

  // Render table mode
  return (
    <ErrorBoundary fallback={ErrorMessage}>
      <div
        className={classNames(
          'table-container',
          tableHover && 'table-hover-shadow',
        )}
      >
        <TableView />
      </div>
    </ErrorBoundary>
  );
}
