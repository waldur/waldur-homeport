import { State } from '../types';
import * as constants from './constants';

const INITIAL_STATE: State = {
  items: [],
  addingItem: false,
  removingItem: false,
  updatingItem: false,
  creatingOrder: false,
};

export const cartReducer = (state = INITIAL_STATE, action) => {
  const { type, payload } = action;
  switch (type) {
    case constants.ADD_ITEM_REQUEST:
      return {
        ...state,
        addingItem: true,
      };
    case constants.ADD_ITEM_ERROR:
      return {
        ...state,
        addingItem: false,
      };
    case constants.ADD_ITEM_SUCCESS:
      return {
        ...state,
        items: [...state.items, payload.item],
        addingItem: false,
      };
    case constants.REMOVE_ITEM_REQUEST:
      return {
        ...state,
        removingItem: true,
      };
    case constants.REMOVE_ITEM_ERROR:
      return {
        ...state,
        removingItem: false,
      };
    case constants.REMOVE_ITEM_SUCCESS:
      return {
        ...state,
        items: state.items.filter(item => item.uuid !== payload.uuid),
        removingItem: false,
      };
    case constants.UPDATE_ITEM_REQUEST:
      return {
        ...state,
        updatingItem: true,
      };
    case constants.UPDATE_ITEM_ERROR:
      return {
        ...state,
        updatingItem: false,
      };
    case constants.UPDATE_ITEM_SUCCESS:
      return {
        ...state,
        items: [...state.items, payload.item],
        updatingItem: false,
      };
    case constants.CREATE_ORDER_REQUEST:
      return {
        ...state,
        creatingOrder: true,
      };
    case constants.CREATE_ORDER_SUCCESS:
      return {
        ...state,
        creatingOrder: false,
        items: [],
      };
    case constants.CREATE_ORDER_ERROR:
      return {
        ...state,
        creatingOrder: false,
      };
    case constants.SET_ITEMS:
      return {
        ...state,
        items: payload.items,
      };
    default:
      return state;
  }
};
