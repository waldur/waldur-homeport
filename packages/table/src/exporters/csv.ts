import Papa from 'papaparse';

import { saveFile } from './saveFile';

/**
 * Cells a spreadsheet would read as a formula: ones that start with `=`, `+`,
 * `-`, `@`, a tab or a carriage return. PapaParse prefixes them with `'`, which
 * spreadsheets take as "this is text". A plain signed number (`-12.5`, `+3`,
 * `-1,234.50`) is left out: it cannot run anything, and the prefix would turn
 * every negative amount in an export into text.
 */
const FORMULA_CELL = /^(?![-+]\d+(?:[.,]\d+)*$)[=+\-@\t\r]/;

/**
 * PapaParse checks `escapeFormulae` only on string cells and writes any other
 * value with `toString()`, so an array or object cell would reach the file
 * unescaped. Turn those into strings first: arrays as their items joined with
 * ", ", other objects with `String()`. Dates stay as they are, for PapaParse's
 * own date format; numbers and booleans cannot hold a formula.
 */
const toCell = (value) => {
  if (Array.isArray(value)) return value.map(toCell).join(', ');
  if (value && typeof value === 'object' && !(value instanceof Date)) {
    return String(value);
  }
  return value;
};

const toRow = (row) => {
  if (Array.isArray(row)) return row.map(toCell);
  if (row && typeof row === 'object') {
    return Object.fromEntries(
      Object.entries(row).map(([key, value]) => [key, toCell(value)]),
    );
  }
  return row;
};

const toCells = (data) => {
  if (Array.isArray(data)) return data.map(toRow);
  if (data && Array.isArray(data.data)) {
    return {
      ...data,
      fields: Array.isArray(data.fields)
        ? data.fields.map(toCell)
        : data.fields,
      data: data.data.map(toRow),
    };
  }
  return data;
};

/** Serialises export data to CSV, neutralising formula-like cells. */
export const toCsv = (data) =>
  Papa.unparse(toCells(data), { escapeFormulae: FORMULA_CELL });

export default function saveAsCsv(table, data) {
  const csv = toCsv(data);
  const blob = new Blob([csv], { type: 'text/plain;charset=utf-8' });
  saveFile(blob, `${table}.csv`);
}
