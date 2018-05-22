export const getItems = state => state.marketplace.comparison.items;
export const hasItem = (state, item) => state.marketplace.comparison.items.indexOf(item) !== -1;
export const getCount = state => state.marketplace.comparison.items.length;
