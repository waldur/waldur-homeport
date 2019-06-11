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

export const updateItemRequest = (item: OrderItemResponse) => ({
  type: constants.UPDATE_ITEM_REQUEST,
  payload: {
    item,
  },
});

export const updateItemSuccess = (item: OrderItemResponse) => ({
  type: constants.UPDATE_ITEM_SUCCESS,
  payload: {
    item,
  },
});

export const updateItemError = () => ({
  type: constants.UPDATE_ITEM_ERROR,
});

export const setItems = (items: OrderItemResponse[]) => ({
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
