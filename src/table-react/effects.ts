import { delay } from 'redux-saga';
import { call, put, select, takeEvery, take, race } from 'redux-saga/effects';

import { transformRows } from '@waldur/table-react/utils';

import * as actions from './actions';
import { exportTable } from './export';
import { getTableOptions } from './registry';
import { getTableState } from './store';

export function* fetchList(action) {
  const { table, extraFilter, pullInterval } = action.payload;
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
    if (pullInterval) {
      const { execute } = yield race({
        skip: take(
          action =>
            [actions.FETCH_LIST_START, actions.RESET_PAGINATION].includes(
              action.type,
            ) && action.payload.table === table,
        ),
        execute: delay(
          typeof pullInterval === 'function' ? pullInterval() : pullInterval,
        ),
      });
      if (execute) {
        yield put(
          actions.fetchListStart(table, extraFilter, options.pullInterval),
        );
      }
    }
  } catch (error) {
    yield put(actions.fetchListError(table, error));
  }
}

export default function* watchFetchList() {
  yield takeEvery(actions.FETCH_LIST_START, fetchList);
  yield takeEvery(actions.EXPORT_TABLE_AS, exportTable);
}
