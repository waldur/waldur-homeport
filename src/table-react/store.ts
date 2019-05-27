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
      const {[action.payload.uuid]: _, ...entities} = state.entities;
      const index = state.order.indexOf(action.payload.uuid);
      return {
        ...state,
        entities,
        order: [...state.order.slice(0, index), ...state.order.slice(index + 1)],
      };

    case actions.PAGE_SIZE_UPDATE:
      return {
        ...state,
        pagination: {
          ...state.pagination,
          pageSize: action.payload.size.value,
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

  default:
    return state;
  }
};

export const reducer = createByKey(
  action => action.payload && action.payload.table,
  action => action.payload.table,
)(pagination);

type TableSelector = (table: string) => (state: StateTables) => TableState;

export const getTableState: TableSelector = table => state => {
  if (state.tables && state.tables[table]) {
    return state.tables[table];
  } else {
    return INITIAL_STATE;
  }
};
