import { isEqual } from 'lodash';

import { FilterState } from '../types';

import { SET_MARKETPLACE_FILTER } from './actions';

const INITIAL_STATE: FilterState = {
  filtersStorage: [],
};

export const filterReducer = (state = INITIAL_STATE, action): FilterState => {
  const { type, payload } = action;
  if (type === SET_MARKETPLACE_FILTER) {
    const item = payload.item;
    const index = state.filtersStorage.findIndex(
      (filter) => filter.name === item.name,
    );
    const isEmpty = !item.value && item.value !== false && !item.value?.length;

    if (index > -1) {
      if (isEqual(state.filtersStorage[index].value, item.value)) {
        return state;
      }
      const newItems = [...state.filtersStorage];
      if (isEmpty) {
        newItems.splice(index, 1);
      } else {
        newItems.splice(index, 1, item);
      }
      return {
        ...state,
        filtersStorage: newItems,
      };
    } else {
      if (!isEmpty) {
        return {
          ...state,
          filtersStorage: state.filtersStorage.concat([item]),
        };
      }
      return state;
    }
  }
  return state;
};
