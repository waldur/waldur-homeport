import copy from 'copy-to-clipboard';
import FileSaver from 'file-saver';
import Papa from 'papaparse';
import { put, call, select } from 'redux-saga/effects';

import { orderByFilter } from '@waldur/core/utils';
import { RootState } from '@waldur/store/reducers';
import { fetchAll } from '@waldur/table/api';

import { blockStart, blockStop, exportTableAs } from './actions';
import exportExcel from './excel';
import { exportAsPdf } from './exportAsPdf';
import { getTableOptions } from './registry';
import { selectTableRows } from './selectors';
import { getTableState } from './store';
import { TableRequest } from './types';

export function saveAsCsv(table, data) {
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/plain;charset=utf-8' });
  FileSaver.saveAs(blob, `${table}.csv`);
}

function exportToClipboard(_, data) {
  const text = Papa.unparse(data);
  copy(text);
}

const exporters = {
  csv: saveAsCsv,
  clipboard: exportToClipboard,
  pdf: exportAsPdf,
  excel: exportExcel,
};

export function* exportTable(action: ReturnType<typeof exportTableAs>) {
  const { table, config, props } = action.payload;
  let rows = yield select((state: RootState) => selectTableRows(state, table));
  const { exportFields, exportKeys, exportRow, fetchData, ...options } =
    getTableOptions(table);

  if (options.exportAll) {
    const state = yield select(getTableState(table));
    yield put(blockStart(table));
    let defaultFilter;
    if (options.getDefaultFilter) {
      defaultFilter = yield select(options.getDefaultFilter);
    }
    let propFilter;
    if (props && options.mapPropsToFilter) {
      propFilter = options.mapPropsToFilter(props);
    }
    const request: TableRequest = {
      pageSize: Math.max(state.pagination.resultCount, 200),
      currentPage: 1,
      filter: config.withFilters
        ? {
            ...defaultFilter,
            ...propFilter,
            ...options.filter,
          }
        : { ...propFilter },
    };
    if (config.withFilters && options.queryField && state.query) {
      request.filter[options.queryField] = state.query;
    }
    if (state.sorting && state.sorting.field) {
      request.filter.o = orderByFilter(state.sorting);
    }
    if (exportKeys && exportKeys.length > 0) {
      request.filter.field = exportKeys;
    }

    rows = yield call(fetchAll, fetchData, request);
    yield put(blockStop(table));
  }

  const fields =
    typeof exportFields === 'function' ? exportFields(props) : exportFields;

  const data = {
    fields,
    data: rows.map((row) => exportRow(row, props)),
  };
  exporters[config.format](table, data);
}
