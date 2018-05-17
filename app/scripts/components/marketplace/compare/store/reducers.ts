import * as constants from './constants';

const INITIAL_STATE = {
  items: [],
};

export const comparisonReducer = (state = INITIAL_STATE, action) => {
  const { type, payload } = action;
  switch (type) {
    case constants.COMPARISON_ITEM_ADD:
      return {
        ...state,
        items: [...state.items, payload.item],
      };
    case constants.COMPARISON_ITEM_REMOVE:
      const index = state.items.indexOf(payload.item);
      return {
        ...state,
        items: [...state.items.slice(0, index), ...state.items.slice(index + 1)],
      };
    default:
      return state;
  }
};
