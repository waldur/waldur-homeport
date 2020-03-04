export const getItems = state => state.marketplace.comparison.items;
export const hasItem = (state, item) =>
  state.marketplace.comparison.items.find(i => i.uuid === item.uuid) !==
  undefined;
export const getCount = state => state.marketplace.comparison.items.length;
