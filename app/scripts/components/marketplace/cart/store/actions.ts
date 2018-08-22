import { Action } from '@waldur/core/reducerActions';
import { OrderState, OrderItem } from '@waldur/marketplace/cart/types';

import * as constants from './constants';

export const addItem = (item: OrderItem): Action<{item}> => ({
  type: constants.ADD_ITEM,
  payload: {
    item,
  },
});

export const removeItem = (item: OrderItem): Action<{item}> => ({
  type: constants.REMOVE_ITEM,
  payload: {
    item,
  },
});

export const setCart = cart => ({
  type: constants.SET_CART,
  payload: {
    cart,
  },
});

export const clearCart = () => ({
  type: constants.CLEAR_CART,
});

export const setState = (state: OrderState): Action<{state}> => ({
  type: constants.SET_STATE,
  payload: {
    state,
  },
});

export const createOrder = () => ({
  type: constants.CREATE_ORDER,
});
