import { OrderItemRequest } from '@waldur/marketplace/cart/types';
import { OrderItemResponse } from '@waldur/marketplace/orders/types';

import * as constants from './constants';

export const addItemRequest = (item: OrderItemRequest) => ({
  type: constants.ADD_ITEM_REQUEST,
  payload: {
    item,
  },
});

export const addItemSuccess = (item: OrderItemResponse) => ({
  type: constants.ADD_ITEM_SUCCESS,
  payload: {
    item,
  },
});

export const removeItemRequest = (uuid: string) => ({
  type: constants.REMOVE_ITEM_REQUEST,
  payload: {
    uuid,
  },
});

export const removeItemSuccess = (uuid: string) => ({
  type: constants.REMOVE_ITEM_SUCCESS,
  payload: {
    uuid,
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

export const createOrder = () => ({
  type: constants.CREATE_ORDER,
});
