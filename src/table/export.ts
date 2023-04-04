import copy from 'copy-to-clipboard';
import FileSaver from 'file-saver';
import Papa from 'papaparse';
import { put, call, select } from 'redux-saga/effects';

import { RootState } from '@waldur/store/reducers';
import { fetchAll } from '@waldur/table/api';

import { blockStart, blockStop } from './actions';
import exportExcel from './excel';
import { exportAsPdf } from './exportAsPdf';
import { getTableOptions } from './registry';
import { selectTableRows } from './selectors';

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

export function* exportTable(action) {
  const { table, format, props } = action.payload;
  let rows = yield select((state: RootState) => selectTableRows(state, table));
  const { exportFields, exportRow, fetchData, exportAll, mapPropsToFilter } =
    getTableOptions(table);

  if (exportAll) {
    yield put(blockStart(table));
    let propFilter;
    if (props && mapPropsToFilter) {
      propFilter = mapPropsToFilter(props);
    }
    rows = yield call(fetchAll, fetchData, propFilter);
    yield put(blockStop(table));
  }

  const fields =
    typeof exportFields === 'function' ? exportFields(props) : exportFields;

  const data = {
    fields,
    data: rows.map((row) => exportRow(row, props)),
  };
  exporters[format](table, data);
}
