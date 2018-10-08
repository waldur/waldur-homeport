import { call, put, select, takeEvery } from 'redux-saga/effects';

import { transformRows } from '@waldur/table-react/utils';

import * as actions from './actions';
import { exportTable } from './export';
import { getTableOptions } from './registry';
import { getTableState } from './store';

function* fetchList(action) {
  const {table, extraFilter} = action.payload;
  try {
    const state = yield select(getTableState(table));
    const options = getTableOptions(table);
    let filter;
    if (options.getDefaultFilter) {
      filter = yield select(options.getDefaultFilter);
    }
    const request = {
      currentPage: state.pagination.currentPage,
      pageSize: state.pagination.pageSize,
      filter: {
        ...filter,
        ...extraFilter,
      },
    };
    if (options.queryField && state.query !== '') {
      request.filter[options.queryField] = state.query;
    }
    if (state.sorting && state.sorting.field) {
      let field = state.sorting.field;
      if (state.sorting.mode === 'desc') {
        field = `-${field}`;
      }
      request.filter.o = field;
    }

    const { rows, resultCount } = yield call(options.fetchData, request);
    const { entities, order } = transformRows(rows);
    yield put(actions.fetchListDone(table, entities, order, resultCount));
    if (state.sorting && state.sorting.loading) {
      yield put(actions.sortListDone(table));
    }
  } catch (error) {
    yield put(actions.fetchListError(table, error));
  }
}

export default function* watchFetchList() {
  yield takeEvery(actions.FETCH_LIST_START, fetchList);
  yield takeEvery(actions.EXPORT_TABLE_AS, exportTable);
}
