export const getItems = state => state.marketplace.comparison.items;
export const getIsCompared = (state, item) => state.marketplace.comparison.items.indexOf(item) !== -1;
export const getComparisonCount = state => state.marketplace.comparison.items.length;

export const getInShoppingCart = (state, item) => state.marketplace.cart.items.indexOf(item) !== -1;
export const getShoppingCartCount = state => state.marketplace.cart.items.length;
export const getShoppingCartItems = state => state.marketplace.cart.items;
export const getShoppingCartTotal = state => state.marketplace.cart.items.reduce(
  (total, current) => total + current.price, 0);
