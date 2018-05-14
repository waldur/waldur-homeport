export const getItems = state => state.marketplace.items;
export const getIsCompared = (state, item) => state.marketplace.items.indexOf(item) !== -1;
export const getComparisonCount = state => state.marketplace.items.length;
