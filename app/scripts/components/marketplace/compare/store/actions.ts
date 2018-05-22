import { Action } from '@waldur/core/reducerActions';
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
