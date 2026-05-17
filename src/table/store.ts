import { arrayMove } from '@dnd-kit/sortable';
import { isEqual } from 'lodash-es';
import { Reducer } from 'redux';

import { ALL_RESOURCES_TABLE_ID } from '@/marketplace/resources/list/constants';
import { createByKey } from '@/store/utils';

import * as actions from './actions';
import { INITIAL_STATE } from './constants';
import { TableState } from './types';

const deleteEntity = (state, action) => {
  const { [action.payload.uuid]: _, ...entities } = state.entities;
  const index = state.order.indexOf(action.payload.uuid);
  return {
    ...state,
    entities,
    order: [...state.order.slice(0, index), ...state.order.slice(index + 1)],
  };
};

const pagination = (state = INITIAL_STATE, action): TableState => {
  switch (action.type) {
    case actions.FETCH_LIST_START:
      return {
        ...state,
        loading: true,
      };

    case actions.FETCH_LIST_DONE:
      return {
        ...state,
        entities: action.payload.entities,
        order: action.payload.order,
        pagination: {
          ...state.pagination,
          resultCount: action.payload.resultCount,
        },
        loading: false,
        error: null,
        firstFetch: false,
      };

    case actions.FETCH_LIST_ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload.error,
      };

    case actions.FETCH_LIST_GOTO_PAGE:
      return {
        ...state,
        pagination: {
          ...state.pagination,
          currentPage: action.payload.page,
        },
      };

    case actions.SET_MODE:
      return {
        ...state,
        mode: action.payload.mode,
      };

    case actions.SET_FILTER_QUERY:
      return {
        ...state,
        query: action.payload.query,
      };

    case actions.RESET_PAGINATION:
      return {
        ...state,
        pagination: {
          ...state.pagination,
          currentPage: 1,
        },
      };

    case actions.ENTITY_CREATE:
      return {
        ...state,
        entities: {
          ...state.entities,
          [action.payload.uuid]: action.payload.content,
        },
        order: [...state.order, action.payload.uuid],
      };

    case actions.ENTITY_UPDATE:
      return {
        ...state,
        entities: {
          ...state.entities,
          [action.payload.uuid]:
            typeof action.payload.content === 'function'
              ? action.payload.content(state.entities[action.payload.uuid])
              : action.payload.content,
        },
      };

    case actions.ENTITY_DELETE:
      return deleteEntity(state, action);

    case actions.PAGE_SIZE_UPDATE:
      return {
        ...state,
        pagination: {
          ...state.pagination,
          pageSize: action.payload.size,
        },
      };

    case actions.SORT_LIST_START:
      return {
        ...state,
        sorting: {
          ...state.sorting,
          ...action.payload.sorting,
          loading: true,
        },
      };

    case actions.SORT_LIST_DONE:
      return {
        ...state,
        sorting: {
          ...state.sorting,
          loading: false,
        },
      };

    case actions.SET_FILTER_POSITION:
      return {
        ...state,
        filterPosition: action.payload.filterPosition,
      };

    case actions.SET_FILTER: {
      const item = action.payload.item;
      const index = state.filtersStorage.findIndex(
        (filter) => filter.name === item.name,
      );
      const isEmpty =
        (!item.value && item.value !== false) ||
        (Array.isArray(item.value) && !item.value.length);

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

    case actions.APPLY_FILTERS:
      return {
        ...state,
        applyFilters: action.payload.apply,
      };

    case actions.SET_SAVED_FILTERS:
      return {
        ...state,
        savedFilters: action.payload.items,
      };

    case actions.SELECT_SAVED_FILTER:
      return {
        ...state,
        selectedSavedFilter: action.payload.item,
      };

    case actions.TOGGLE_ROW:
      return {
        ...state,
        toggled: {
          ...state.toggled,
          [action.payload.row]: !state.toggled[action.payload.row],
        },
      };

    case actions.SET_TOGGLED:
      return {
        ...state,
        toggled: action.payload.toggled,
      };

    case actions.SELECT_ROW: {
      const row = action.payload.row;
      const index = state.selectedRows.findIndex(
        (item) => item.uuid === row.uuid,
      );
      if (index > -1) {
        return {
          ...state,
          selectedRows: [
            ...state.selectedRows.slice(0, index),
            ...state.selectedRows.slice(index + 1),
          ],
        };
      } else {
        return {
          ...state,
          selectedRows: state.selectedRows.concat([row]),
        };
      }
    }

    case actions.SELECT_ALL_ROWS: {
      const rows = action.payload.rows;
      const isAllSelected =
        state.selectedRows && state.selectedRows.length >= rows.length;
      if (isAllSelected) {
        return {
          ...state,
          selectedRows: [],
        };
      } else {
        return {
          ...state,
          selectedRows: [...rows],
        };
      }
    }

    case actions.RESET_SELECTION: {
      return {
        ...state,
        selectedRows: [],
        firstFetch: true,
      };
    }

    case actions.TOGGLE_COLUMN:
      return {
        ...state,
        activeColumns: {
          ...state.activeColumns,
          [action.payload.id]:
            action.payload.value === false
              ? false
              : action.payload.value === true
                ? action.payload.column.keys
                : state.activeColumns[action.payload.id]
                  ? false
                  : action.payload.column.keys,
        },
      };

    case actions.INIT_COLUMN_POSITIONS: {
      return {
        ...state,
        columnPositions: action.payload.columnPositions,
      };
    }

    case actions.SWAP_COLUMNS: {
      const oldIndex = state.columnPositions.indexOf(action.payload.column1);
      const newIndex = state.columnPositions.indexOf(action.payload.column2);

      return {
        ...state,
        columnPositions: arrayMove(state.columnPositions, oldIndex, newIndex),
      };
    }

    case actions.RESET_COLUMNS:
      return {
        ...state,
        activeColumns: {},
        columnPositions: [],
      };

    default:
      return state;
  }
};

export const reducer = createByKey(
  (action) => action.payload && action.payload.table,
  (action) => action.payload.table,
)(pagination) as Reducer<Record<string, TableState>>;

const initialTableState = {
  // We need this to be created first because we use this for sidebar resource filters
  [ALL_RESOURCES_TABLE_ID]: INITIAL_STATE,
};

export const tableInitialReducer = (state = initialTableState, action) => {
  const tableState = reducer(state, action);
  return {
    ...state,
    ...tableState,
  };
};
