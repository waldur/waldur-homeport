import { Action } from '@waldur/core/reducerActions';
import { Offering } from '@waldur/marketplace/types';

import * as constants from './constants';

export const addItem = (item: Offering): Action<{item}> => ({
  type: constants.ADD_ITEM,
  payload: {
    item,
  },
});

export const removeItem = (item: Offering): Action<{item}> => ({
  type: constants.REMOVE_ITEM,
  payload: {
    item,
  },
});
