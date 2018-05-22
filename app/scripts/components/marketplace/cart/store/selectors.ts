const getCart = state => state.marketplace.cart;

export const hasItem = (state, item) => getCart(state).items.indexOf(item) !== -1;

export const getCount = state => getCart(state).items.length;

export const getItems = state => getCart(state).items;

export const getTotal = state => getCart(state).items.reduce(
  (total, current) => total + current.price, 0);

export const getState = state => getCart(state).state;
