import { Action } from '@waldur/core/reducerActions';
import { OrderState } from '@waldur/marketplace/cart/types';
import { Product } from '@waldur/marketplace/types';

import * as constants from './constants';

export const addItem = (item: Product): Action<{item}> => ({
  type: constants.ADD_ITEM,
  payload: {
    item,
  },
});

export const removeItem = (item: Product): Action<{item}> => ({
  type: constants.REMOVE_ITEM,
  payload: {
    item,
  },
});

export const setState = (state: OrderState): Action<{state}> => ({
  type: constants.SET_STATE,
  payload: {
    state,
  },
});
