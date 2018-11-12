import { Offering } from '@waldur/marketplace/types';

import * as constants from './constants';

export const addItem = (item: Offering) => ({
  type: constants.ADD_ITEM,
  payload: {
    item,
  },
});

export const removeItem = (item: Offering) => ({
  type: constants.REMOVE_ITEM,
  payload: {
    item,
  },
});

export const setItems = (items: Offering[]) => ({
  type: constants.SET_ITEMS,
  payload: {
    items,
  },
});
