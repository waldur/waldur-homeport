import { exportPdf } from 'waldur-js-client';

import { translate } from 'waldur-i18n-runtime';

import {
  countCharacters,
  getPdfSizeWarning,
  getPdfTextWarning,
  getPdfTitle,
} from './pdfLimits';
import { saveFile } from './saveFile';
import { ExportData } from './types';

const toText = (value: unknown) =>
  value === null || value === undefined ? '' : String(value);

/** The server renders the PDF, with the same fonts as invoices. */
export default async function exportAsPdf(table: string, data: ExportData) {
  // The API takes one cell per column. A row longer than the header gets
  // blank headings rather than losing cells, and short rows are padded.
  let width = data.fields.length;
  for (const row of data.data) {
    width = Math.max(width, row.length);
  }
  if (!width) {
    throw new Error(translate('This table has no columns to export.'));
  }
  // Checked before a single cell is converted: a table far over the limits
  // is refused without being built.
  const sizeWarning = getPdfSizeWarning(data.data.length, width);
  if (sizeWarning) {
    throw new Error(sizeWarning);
  }
  const columns = Array.from({ length: width }, (_, i) =>
    toText(data.fields[i]),
  );
  const rows = data.data.map((row) => columns.map((_, i) => toText(row[i])));
  let characters = 0;
  for (const text of columns.concat(...rows)) {
    characters += countCharacters(text);
  }
  const textWarning = getPdfTextWarning(characters);
  if (textWarning) {
    throw new Error(textWarning);
  }
  const { data: pdf } = await exportPdf({
    body: { title: getPdfTitle(table), columns, rows },
  });
  saveFile(pdf, `${table}.pdf`);
}
