import { saveFile } from './saveFile';

/** Rows as the API returned them, not the columns: unlike the other formats
 * this is for a program or a model to read, so nothing is flattened. */
export default function saveAsJson(table: string, rows: unknown[]) {
  const json = JSON.stringify(rows, null, 2);
  const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
  saveFile(blob, `${table}.json`);
}
