import { createSelector } from 'reselect';

import { INITIAL_STATE } from './constants';
import { type TableState, type TablesRootState } from './types';

// Stable empty references to avoid creating new objects on each selector call
const EMPTY_OBJECT = {};
const EMPTY_ARRAY = [];

export const selectTableSavedFilters = (
  state: TablesRootState,
  table: string,
) => {
  if (state.tables && state.tables[table]) {
    return state.tables[table].savedFilters;
  }
  return EMPTY_ARRAY;
};

export const selectSelectedSavedFilter = (
  state: TablesRootState,
  table: string,
) => {
  if (state.tables && state.tables[table]) {
    return state.tables[table].selectedSavedFilter;
  }
  return null;
};

export const selectFiltersStorage = (state: TablesRootState, table: string) => {
  if (state.tables && state.tables[table]) {
    return state.tables[table].filtersStorage;
  }
  return null;
};

// Names of the filter fields this table actually renders.
// Returns a stable empty array when the table has no registrations yet, so it
// is safe to use directly as a useEffect dependency.
export const selectRegisteredFilterNames =
  (table: string) =>
  (state: TablesRootState): string[] =>
    getTableState(table)(state)?.registeredFilterNames ?? EMPTY_ARRAY;

export const selectSelectedRows =
  (table: string) => (state: TablesRootState) => {
    if (state.tables && state.tables[table]) {
      return state.tables[table].selectedRows;
    }
    return null;
  };

type TableSelector = (table: string) => (state: TablesRootState) => TableState;

export const getTableState: TableSelector =
  (table) => (state: TablesRootState) => {
    if (state.tables && state.tables[table]) {
      return state.tables[table];
    } else {
      return INITIAL_STATE;
    }
  };

/** Converts filtersStorage array into a flat {name: value} map.
 *  This replaces `useFormState().values` in filter consumers.
 *
 *  Selector instances are cached per table so that callers which invoke this
 *  factory inline during render (e.g. `useSelector(selectFilterValues(table))`)
 *  always receive the same memoized selector. Creating a fresh `createSelector`
 *  on every render defeats memoization: the inner reduce returns a new object
 *  reference each render, which makes `useSyncExternalStore` detect a changed
 *  snapshot every pass and re-render forever ("Maximum update depth exceeded").
 */
const filterValuesSelectorCache = new Map<
  string,
  (state: TablesRootState) => Record<string, any>
>();

export const selectFilterValues = (table: string) => {
  let selector = filterValuesSelectorCache.get(table);
  if (!selector) {
    selector = createSelector(
      [(state: TablesRootState) => getTableState(table)(state)?.filtersStorage],
      (filtersStorage) => {
        if (!filtersStorage?.length) return EMPTY_OBJECT;
        return filtersStorage.reduce(
          (acc, f) => {
            acc[f.name] = f.value;
            return acc;
          },
          {} as Record<string, any>,
        );
      },
    );
    filterValuesSelectorCache.set(table, selector);
  }
  return selector;
};

/** Returns a single filter value by name */
export const selectFilterValue =
  (table: string, name: string) => (state: TablesRootState) =>
    getTableState(table)(state)?.filtersStorage?.find((f) => f.name === name)
      ?.value ?? null;
