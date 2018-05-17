import { Action } from '@waldur/core/reducerActions';
import { Product } from '@waldur/marketplace/types';

import * as constants from './constants';

export const addCartItem = (item: Product): Action<{item}> => ({
  type: constants.CART_ITEM_ADD,
  payload: {
    item,
  },
});

export const removeCartItem = (item: Product): Action<{item}> => ({
  type: constants.CART_ITEM_REMOVE,
  payload: {
    item,
  },
});
