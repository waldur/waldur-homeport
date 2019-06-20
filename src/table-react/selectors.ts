import { createSelector } from 'reselect';

const selectTableEntities = (state, table) => {
  if (state.tables && state.tables[table]) {
    return state.tables[table].entities;
  }
  return {};
};

const selectTableEntitiesOrder = (state, table) => {
  if (state.tables && state.tables[table]) {
    return state.tables[table].order;
  }
  return [];
};

export const getTableEntityCount = createSelector(
  selectTableEntities,
  entities => Object.keys(entities).length
);

export const selectTableRows = createSelector(
  selectTableEntities,
  selectTableEntitiesOrder,
  (entities, order) => {
    const rows = [];

    order.forEach(uuid => {
      rows.push(entities[uuid]);
    });
    return rows;
  }
);
