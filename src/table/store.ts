import { arrayMove } from '@dnd-kit/sortable';
import { isEqual } from 'lodash-es';
import {
  combineReducers,
  legacy_createStore as createStore,
  Reducer,
  Store,
} from 'redux';

import * as actions from './actions';
import { INITIAL_STATE } from './constants';
import { TableState, TablesRootState, TablesState } from './types';

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
        if (
          isEqual(state.filtersStorage[index].value, item.value) &&
          state.filtersStorage[index].component === item.component
        ) {
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

    case actions.REGISTER_FILTER_NAME: {
      const name = action.payload.name;
      if (!name || state.registeredFilterNames?.includes(name)) {
        return state;
      }
      return {
        ...state,
        registeredFilterNames: [...(state.registeredFilterNames || []), name],
      };
    }

    case actions.CLEAR_REGISTERED_FILTER_NAMES:
      if (!state.registeredFilterNames?.length) {
        return state;
      }
      return {
        ...state,
        registeredFilterNames: [],
      };

    case actions.CLEAR_ALL_FILTERS:
      return {
        ...state,
        filtersStorage: [],
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

    case actions.TOGGLE_COLUMN_PIN: {
      const current = state.pinnedColumnKeys || [];
      return {
        ...state,
        pinnedColumnKeys: current.includes(action.payload.id)
          ? current.filter((key) => key !== action.payload.id)
          : [...current, action.payload.id],
      };
    }

    case actions.RESET_COLUMNS:
      return {
        ...state,
        activeColumns: {},
        columnPositions: [],
        pinnedColumnKeys: [],
      };

    default:
      return state;
  }
};

/** Every table's state, keyed by table id; an action names its table in
 * `payload.table` and leaves the others alone. */
export const tablesReducer: Reducer<TablesState> = (state = {}, action) => {
  const table = action.payload?.table;
  if (!table) {
    return state;
  }
  return { ...state, [table]: pagination(state[table], action) };
};

/** A store holding only table state, for an app with no Redux store of its
 * own. An app that has one adds `tables: tablesReducer` to it instead. */
export const createTablesStore = (
  tables: TablesState = {},
): Store<TablesRootState> =>
  createStore(combineReducers({ tables: tablesReducer }), { tables });
