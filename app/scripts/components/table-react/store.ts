import { createByKey } from '@waldur/store/utils';
import * as actions from './actions';
import { TableState } from './types';

const INITIAL_STATE: TableState = {
  rows: [],
  loading: false,
  error: null,
  pagination: {
    pageSize: 10,
    resultCount: 0,
    currentPage: 1,
  },
};

const pagination = (state=INITIAL_STATE, action): TableState => {
  switch (action.type) {
  case actions.FETCH_LIST_START:
    return {
      ...state,
      loading: true,
    };

  case actions.FETCH_LIST_DONE:
    return {
      ...state,
      rows: action.payload.rows,
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
      }
    };

  case actions.SET_FILTER_QUERY:
    return {
      ...state,
      query: action.payload.query,
    };

  default:
    return state;
  }
};

export const reducer = createByKey(
  action => action.payload && action.payload.table,
  action => action.payload.table
)(pagination);

type TableSelector = (table: string) => (state: {tables: {[key: string]: TableState}}) => TableState;

export const getTableState: TableSelector = table => state => {
  if (state.tables && state.tables[table]) {
    return state.tables[table];
  } else {
    return INITIAL_STATE;
  }
};
