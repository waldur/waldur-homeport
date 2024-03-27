import { RootState } from '@waldur/store/reducers';

const getCart = (state: RootState) => state.marketplace.cart;

export const getItems = (state: RootState) => getCart(state).items;

export const isAddingItem = (state: RootState) => getCart(state).addingItem;
