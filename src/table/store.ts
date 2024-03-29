import { Reducer } from 'redux';

import { RootState } from '@waldur/store/reducers';
import { createByKey } from '@waldur/store/utils';

import * as actions from './actions';
import { TableState, StateTables } from './types';

const INITIAL_STATE: TableState = {
  entities: {},
  order: [],
  loading: false,
  error: null,
  pagination: {
    pageSize: 10,
    resultCount: 0,
    currentPage: 1,
  },
  sorting: {
    mode: undefined,
    field: null,
    loading: false,
  },
  toggled: {},
  filterVisible: true,
  selectedRows: [],
  firstFetch: true,
};

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
          [action.payload.uuid]: action.payload.content,
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

    case actions.BLOCK_START:
      return {
        ...state,
        blocked: true,
      };

    case actions.BLOCK_STOP:
      return {
        ...state,
        blocked: false,
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

    case actions.TOGGLE_ROW:
      return {
        ...state,
        toggled: {
          ...state.toggled,
          [action.payload.row]: !state.toggled[action.payload.row],
        },
      };

    case actions.TOGGLE_FILTER:
      return {
        ...state,
        filterVisible: !state.filterVisible,
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
      };
    }

    default:
      return state;
  }
};

export const reducer = createByKey(
  (action) => action.payload && action.payload.table,
  (action) => action.payload.table,
)(pagination) as Reducer<Record<string, TableState>>;

type TableSelector = (table: string) => (state: StateTables) => TableState;

export const getTableState: TableSelector = (table) => (state: RootState) => {
  if (state.tables && state.tables[table]) {
    return state.tables[table];
  } else {
    return INITIAL_STATE;
  }
};
