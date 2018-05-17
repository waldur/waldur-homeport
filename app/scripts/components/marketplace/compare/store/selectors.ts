export const getItems = state => state.marketplace.comparison.items;
export const getIsCompared = (state, item) => state.marketplace.comparison.items.indexOf(item) !== -1;
export const getComparisonCount = state => state.marketplace.comparison.items.length;
