import { createSelector } from 'reselect';

import { type RootState } from '@waldur/store/reducers';

import { INITIAL_STATE } from './constants';
import { type StateTables, type TableState } from './types';

// Stable empty references to avoid creating new objects on each selector call
const EMPTY_OBJECT = {};
const EMPTY_ARRAY = [];

const selectTableEntities = (state: RootState, table: string) => {
  if (state.tables && state.tables[table]) {
    return state.tables[table].entities;
  }
  return EMPTY_OBJECT;
};

const selectTableEntitiesOrder = (state: RootState, table: string) => {
  if (state.tables && state.tables[table]) {
    return state.tables[table].order;
  }
  return EMPTY_ARRAY;
};

// Factory: returns a per-table selector with its own cache entry.
// Each call site gets an independent memoization cache, avoiding
// cache thrashing when multiple tables are active simultaneously.
export const makeSelectTableRows = () =>
  createSelector(
    selectTableEntities,
    selectTableEntitiesOrder,
    (entities, order) => {
      const rows = [];
      order.forEach((uuid) => {
        rows.push(entities[uuid]);
      });
      return rows;
    },
  );

export const selectTableSavedFilters = (state: RootState, table: string) => {
  if (state.tables && state.tables[table]) {
    return state.tables[table].savedFilters;
  }
  return EMPTY_ARRAY;
};

export const selectSelectedSavedFilter = (state: RootState, table: string) => {
  if (state.tables && state.tables[table]) {
    return state.tables[table].selectedSavedFilter;
  }
  return null;
};

export const selectFiltersStorage = (state: RootState, table: string) => {
  if (state.tables && state.tables[table]) {
    return state.tables[table].filtersStorage;
  }
  return null;
};

export const selectSelectedRows = (table: string) => (state: RootState) => {
  if (state.tables && state.tables[table]) {
    return state.tables[table].selectedRows;
  }
  return null;
};

type TableSelector = (table: string) => (state: StateTables) => TableState;

export const getTableState: TableSelector = (table) => (state: RootState) => {
  if (state.tables && state.tables[table]) {
    return state.tables[table];
  } else {
    return INITIAL_STATE;
  }
};
