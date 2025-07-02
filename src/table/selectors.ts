import { createSelector } from 'reselect';

import { type RootState } from '@waldur/store/reducers';

import { INITIAL_STATE } from './constants';
import { type StateTables, type TableState } from './types';

const selectTableEntities = (state: RootState, table: string) => {
  if (state.tables && state.tables[table]) {
    return state.tables[table].entities;
  }
  return {};
};

const selectTableEntitiesOrder = (state: RootState, table: string) => {
  if (state.tables && state.tables[table]) {
    return state.tables[table].order;
  }
  return [];
};

export const selectTableRows = createSelector(
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
  return [];
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
