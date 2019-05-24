import FileSaver from 'file-saver';
import Papa from 'papaparse';
import { put, call, select } from 'redux-saga/effects';

import { ENV } from '@waldur/core/services';
import { loadPdfMake } from '@waldur/shims/pdfmake';
import { fetchAll } from '@waldur/table-react/api';

import { blockStart, blockStop } from './actions';
import exportExcel from './excel';
import { getTableOptions } from './registry';
import { selectTableRows } from './selectors';

export function* exportTable(action) {
  const { table, format, props } = action.payload;
  let rows = yield select(state => selectTableRows(state, table));
  const { exportFields, exportRow, fetchData, exportAll, mapPropsToFilter } = getTableOptions(table);

  if (exportAll) {
    yield put(blockStart(table));
    let propFilter;
    if (mapPropsToFilter) {
      propFilter = mapPropsToFilter(props);
    }
    rows = yield call(fetchAll, fetchData, propFilter);
    yield put(blockStop(table));
  }

  const fields = typeof exportFields === 'function' ? exportFields(props) : exportFields;

  const data = {
    fields,
    data: rows.map(row => exportRow(row, props)),
  };
  exporters[format](table, data);
}

const exporters = {
  csv: saveAsCsv,
  clipboard: exportToClipboard,
  pdf: exportAsPdf,
  excel: exportExcel,
};

async function exportAsPdf(table, data) {
  const pdfmake = await loadPdfMake();
  const header = data.fields.map(field => ({
    text: field + '',
    style: 'tableHeader',
  }));
  const rows = data.data.map(row => row.map(cell => ({
    text: cell + '',
  })));
  const doc: Record<string, object> = {
    content: [
      {
        text: table,
        style: 'title',
      },
      {
        table: {
          body: [header].concat(rows),
        },
      },
    ],
    styles: {
      tableHeader: {
        bold: true,
        fontSize: 11,
        color: 'white',
        fillColor: '#2d4154',
        alignment: 'center',
      },
      title: {
        alignment: 'center',
        fontSize: 15,
      },
    },
  };
  const defaultFont = ENV.defaultFont;
  if (defaultFont) {
    doc.defaultStyle = {
      font: defaultFont,
    };
  }
  const pdf = pdfmake.createPdf(doc);
  pdf.getBuffer(buffer => saveAsPdf(table, buffer));
}

function saveAsPdf(table, data) {
  const blob = new Blob([data], {type: 'application/pdf'});
  FileSaver.saveAs(blob, `${table}.pdf`);
}

function saveAsCsv(table, data) {
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], {type: 'text/plain;charset=utf-8'});
  FileSaver.saveAs(blob, `${table}.csv`);
}

function exportToClipboard(_, data) {
  const text = Papa.unparse(data);
  copyToClipboard(text);
}

function copyToClipboard(text) {
  const hiddenDiv = document.createElement('div');
  const style = hiddenDiv.style;
  style.height = '1px';
  style.width = '1px';
  style.overflow = 'hidden';
  style.position = 'fixed';
  style.top = '0px';
  style.left = '0px';

  const textarea = document.createElement('textarea');
  textarea.readOnly = true;
  textarea.value = text;

  hiddenDiv.appendChild(textarea);
  document.body.appendChild(hiddenDiv);

  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(hiddenDiv);
}
