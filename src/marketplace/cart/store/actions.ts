import { OrderRequest } from '@waldur/marketplace/cart/types';
import { OrderResponse } from '@waldur/marketplace/orders/types';

import * as constants from './constants';

export const addItemRequest = (item: OrderRequest) => ({
  type: constants.ADD_ITEM_REQUEST,
  payload: {
    item,
  },
});

export const addItemSuccess = (item: OrderResponse) => ({
  type: constants.ADD_ITEM_SUCCESS,
  payload: {
    item,
  },
});

export const addItemError = () => ({
  type: constants.ADD_ITEM_ERROR,
});

export const removeItemSuccess = (uuid: string) => ({
  type: constants.REMOVE_ITEM_SUCCESS,
  payload: {
    uuid,
  },
});

export const setItems = (items: OrderResponse[]) => ({
  type: constants.SET_ITEMS,
  payload: {
    items,
  },
});

export const createOrderSuccess = () => ({
  type: constants.CREATE_ORDER_SUCCESS,
});

export const createOrderError = () => ({
  type: constants.CREATE_ORDER_ERROR,
});
