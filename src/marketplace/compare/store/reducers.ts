import { Offering } from '@waldur/marketplace/types';

import * as constants from './constants';

interface ComparisonState {
  items: Offering[];
}

const INITIAL_STATE: ComparisonState = {
  items: [],
};

export const comparisonReducer = (
  state = INITIAL_STATE,
  action,
): ComparisonState => {
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
        items: state.items.filter((item) => item.uuid !== payload.item.uuid),
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
