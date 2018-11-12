import * as constants from './constants';

const INITIAL_STATE = {
  items: [],
};

export const comparisonReducer = (state = INITIAL_STATE, action) => {
  const { type, payload } = action;
  switch (type) {
    case constants.ADD_ITEM:
      return {
        ...state,
        items: [...state.items, payload.item],
      };
    case constants.REMOVE_ITEM:
      return {
        ...state,
        items: state.items.filter(item => item.uuid !== payload.item.uuid),
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
