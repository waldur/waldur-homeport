import { State } from '../types';
import * as constants from './constants';

const INITIAL_STATE: State = {
  items: [],
  state: 'Configure',
};

export const cartReducer = (state = INITIAL_STATE, action) => {
  const { type, payload } = action;
  switch (type) {
    case constants.ADD_ITEM:
      return {
        ...state,
        items: [...state.items, payload.item],
      };
    case constants.REMOVE_ITEM:
      const index = state.items.indexOf(payload.item);
      return {
        ...state,
        items: [...state.items.slice(0, index), ...state.items.slice(index + 1)],
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
    case constants.SET_STATE:
      return {
        ...state,
        state: payload.state,
      };
    default:
      return state;
  }
};
