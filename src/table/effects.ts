import {
  delay,
  call,
  put,
  select,
  takeEvery,
  take,
  race,
  cancelled,
} from 'redux-saga/effects';

import { takeLatestPerKey } from '@waldur/core/effects';
import { orderByFilter } from '@waldur/core/utils';
import { transformRows } from '@waldur/table/utils';

import * as actions from './actions';
import { exportTable } from './export';
import { getTableOptions } from './registry';
import { getTableState } from './store';
import { TableRequest } from './types';

export function* fetchList(action) {
  const { table, extraFilter, pullInterval } = action.payload;
  const controller = new AbortController();
  try {
    const state = yield select(getTableState(table));
    const options = getTableOptions(table);
    let filter;
    if (options.getDefaultFilter) {
      filter = yield select(options.getDefaultFilter);
    }
    const request: TableRequest = {
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
      request.filter.o = orderByFilter(state.sorting);
    }
    request.options = { signal: controller.signal };
    if (options.staleTime) {
      request.options.staleTime = options.staleTime;
    }

    // Debounce
    yield delay(100);
    const { rows, resultCount } = yield call(options.fetchData, request);
    const { entities, order } = transformRows(rows);
    if (options.onFetch) {
      options.onFetch(rows, resultCount, state.firstFetch);
    }
    yield put(actions.fetchListDone(table, entities, order, resultCount));
    if (state.sorting && state.sorting.loading) {
      yield put(actions.sortListDone(table));
    }
    if (pullInterval) {
      const { execute } = yield race({
        skip: take(
          (action) =>
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
  } finally {
    if (yield cancelled()) {
      controller.abort();
    }
  }
}

export default function* watchFetchList() {
  yield takeLatestPerKey(
    actions.FETCH_LIST_START,
    fetchList,
    ({ payload: { table } }) => table,
  );
  yield takeEvery(actions.EXPORT_TABLE_AS, exportTable);
}
