import { State } from '../types';
import * as constants from './constants';

const INITIAL_STATE: State = {
  items: [],
};

export const cartReducer = (state = INITIAL_STATE, action) => {
  const { type, payload } = action;
  switch (type) {
    case constants.ADD_ITEM_SUCCESS:
      return {
        ...state,
        items: [...state.items, payload.item],
      };
    case constants.REMOVE_ITEM_SUCCESS:
      return {
        ...state,
        items: state.items.filter(item => item.uuid !== payload.uuid),
      };
    case constants.SET_CART:
      return {
        ...payload.cart,
      };
    case constants.CLEAR_CART:
      return {
        ...state,
        items: [],
      };
    default:
      return state;
  }
};
