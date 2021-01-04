import { createSelector } from 'reselect';

import { RootState } from '@waldur/store/reducers';

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

export const getTableEntityCount = createSelector(
  selectTableEntities,
  (entities) => Object.keys(entities).length,
);

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

export const selectTablePagination = (state: RootState, table: string) => {
  if (state.tables && state.tables[table]) {
    return state.tables[table].pagination;
  }
};

export const selectTableSorting = (state: RootState, table: string) => {
  if (state.tables && state.tables[table]) {
    return state.tables[table].sorting;
  }
};
