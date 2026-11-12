import Papa from 'papaparse';

import { saveFile } from './saveFile';

export default function saveAsCsv(table, data) {
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/plain;charset=utf-8' });
  saveFile(blob, `${table}.csv`);
}
