import copy from 'copy-to-clipboard';
import FileSaver from 'file-saver';
import { isEqual } from 'lodash';
import Papa from 'papaparse';
import { put, call, select } from 'redux-saga/effects';

import { isEmpty, orderByFilter } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { showSuccess } from '@waldur/store/notify';
import { RootState } from '@waldur/store/reducers';
import { fetchAll } from '@waldur/table/api';

import { blockStart, blockStop, exportTableAs } from './actions';
import { DASH_ESCAPE_CODE } from './constants';
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
  const {
    exportFields,
    exportKeys,
    exportRow,
    exportData,
    fetchData,
    ...options
  } = getTableOptions(table);

  const customExport = Boolean(exportFields || exportRow);

  // Calculate array for export data automatically
  let exportColumns = [];
  if (!customExport) {
    // Apply order of columns
    if (
      props.columnPositions &&
      !isEmpty(props.columnPositions.filter(Boolean))
    ) {
      props.columnPositions.forEach((colName) => {
        const column = props.columns.find((col) => col.id === colName);
        if (column) {
          exportColumns.push(column);
        }
      });
    } else {
      exportColumns = props.columns;
    }

    // Apply enabled columns
    if (props.activeColumns && !isEmpty(props.activeColumns)) {
      const activeColumnsKeys = Object.values(props.activeColumns);
      exportColumns = exportColumns.filter((col) =>
        activeColumnsKeys.some((keys) => isEqual(keys, col.keys)),
      );
    }

    // Remove false columns
    exportColumns = exportColumns.filter((col) => col.export !== false);
  }

  if (config.allPages) {
    const state = yield select(getTableState(table));
    yield put(blockStart(table));
    const request: TableRequest = {
      pageSize: Math.max(state.pagination.resultCount, 200),
      currentPage: 1,
      filter: config.withFilters ? { ...options.filter } : {},
    };
    if (config.withFilters && options.queryField && state.query) {
      request.filter[options.queryField] = state.query;
    }
    if (state.sorting && state.sorting.field) {
      request.filter.o = orderByFilter(state.sorting);
    }

    if (customExport) {
      if (exportKeys && exportKeys.length > 0) {
        request.filter.field = exportKeys;
      }
    } else if (exportColumns.length > 0) {
      const autoExportKeys = [];
      exportColumns.map((col) => {
        if (typeof col.export === 'string') {
          autoExportKeys.push(col.export);
        } else if (col.exportKeys) {
          autoExportKeys.push(col.exportKeys);
        } else if (col.keys) {
          autoExportKeys.push(col.keys);
        }
      });
      if (autoExportKeys.length > 0) {
        request.filter.field = autoExportKeys;
      }
    }

    rows = yield call(fetchAll, fetchData, request);
    yield put(blockStop(table));
  }

  let data;
  if (exportFields || exportRow) {
    // Generate custom export data
    const fields =
      typeof exportFields === 'function' ? exportFields(props) : exportFields;

    data = {
      fields,
      data: exportData
        ? exportData(rows, props)
        : rows.map((row) => exportRow(row, props)),
    };
  } else {
    // Generate export data automatically
    const fields = exportColumns.map(
      (col) =>
        col.exportTitle || (typeof col.title === 'string' ? col.title : col.id),
    );

    data = {
      fields,
      data: rows.map((row) =>
        exportColumns.map((col) => {
          if (col.export && typeof col.export === 'function') {
            return col.export(row);
          }
          const value =
            row[col.export] ||
            row[col.keys ? col.keys[0] : null] ||
            row[col.orderField] ||
            row[col.id];

          if (typeof value === 'string' || [null, undefined].includes(value)) {
            return value || DASH_ESCAPE_CODE;
          } else {
            return value;
          }
        }),
      ),
    };
  }

  yield call(exporters[config.format], table, data);
  yield put(
    showSuccess(
      translate('Table has been exported to {format}.', {
        format: config.format,
      }),
    ),
  );
  yield put(closeModalDialog());
}
