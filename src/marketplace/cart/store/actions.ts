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

export const removeItemRequest = (uuid: string, project: string) => ({
  type: constants.REMOVE_ITEM_REQUEST,
  payload: {
    uuid,
    project,
  },
});

export const removeItemSuccess = (uuid: string) => ({
  type: constants.REMOVE_ITEM_SUCCESS,
  payload: {
    uuid,
  },
});

export const removeItemError = () => ({
  type: constants.REMOVE_ITEM_ERROR,
});

export const updateItemRequest = (item: OrderResponse) => ({
  type: constants.UPDATE_ITEM_REQUEST,
  payload: {
    item,
  },
});

export const updateItemSuccess = (item: OrderResponse) => ({
  type: constants.UPDATE_ITEM_SUCCESS,
  payload: {
    item,
  },
});

export const updateItemError = () => ({
  type: constants.UPDATE_ITEM_ERROR,
});

export const setItems = (items: OrderResponse[]) => ({
  type: constants.SET_ITEMS,
  payload: {
    items,
  },
});

export const createOrderRequest = () => ({
  type: constants.CREATE_ORDER_REQUEST,
});

export const createOrderSuccess = () => ({
  type: constants.CREATE_ORDER_SUCCESS,
});

export const createOrderError = () => ({
  type: constants.CREATE_ORDER_ERROR,
});
