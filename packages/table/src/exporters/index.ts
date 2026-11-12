import { ExportData } from './types';

const exporters = {
  csv: () => import('./csv'),
  clipboard: () => import('./clipboard'),
  pdf: () => import('./pdf'),
  excel: () => import('./excel'),
};

export default async function exportAs(format, table, data: ExportData) {
  const exporter = await exporters[format]();
  await exporter.default(table, data);
}
