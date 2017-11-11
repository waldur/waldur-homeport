import { select } from 'redux-saga/effects';
import FileSaver from 'file-saver';
import Papa from 'papaparse';

import { getTableState } from './store';
import { getTableOptions } from './registry';

export function* exportTable(action) {
  const { table, format } = action.payload;
  const { rows } = yield select(getTableState(table));

  const { exportFields, exportRow } = getTableOptions(table);
  const data = {
    fields: exportFields,
    data: rows.map(exportRow),
  };
  exporters[format](table, data);
}

const exporters = {
  csv: saveAsCsv,
  clipboard: exportToClipboard,
  pdf: exportAsPdf,
};

async function exportAsPdf(table, data) {
  const pdfmake = await loadPdfMake();
  const header = data.fields.map(field => ({
    text: field + '',
    style: 'tableHeader'
  }));
  const rows = data.data.map(row => row.map(cell => ({
    text: cell + ''
  })));
  const doc = {
    content: [
      {
        text: table,
        style: 'title',
      },
      {
        table: {
          body: [header].concat(rows)
        }
      }
    ],
    styles: {
      tableHeader: {
        bold: true,
        fontSize: 11,
        color: 'white',
        fillColor: '#2d4154',
        alignment: 'center'
      },
      title: {
        alignment: 'center',
        fontSize: 15
      },
    }
  };
  const pdf = pdfmake.createPdf(doc);
  pdf.getBuffer(buffer => saveAsPdf(table, buffer));
}

function saveAsPdf(table, data) {
  const blob = new Blob([data], {type: 'application/pdf'});
  FileSaver.saveAs(blob, `${table}.pdf`);
}

async function loadPdfMake() {
  const pdfMake = await import(/* webpackChunkName: "pdfmake" */ 'pdfmake/build/pdfmake');
  const pdfFonts = await import(/* webpackChunkName: "vfs_fonts" */ 'pdfmake/build/vfs_fonts');
  pdfMake.vfs = pdfFonts.pdfMake.vfs;
  return pdfMake;
}

function saveAsCsv(table, data) {
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], {type: 'text/plain;charset=utf-8'});
  FileSaver.saveAs(blob, `${table}.csv`);
}

function exportToClipboard(table, data) {
  const text = Papa.unparse(data);
  copyToClipboard(text);
}

function copyToClipboard(text) {
  const hiddenDiv = document.createElement('div');
  let style = hiddenDiv.style;
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
