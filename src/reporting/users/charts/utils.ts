import { translate } from '@/i18n';
import { ExportData } from '@/table/exporters/types';

/**
 * Common helper to format chart data for export (XLSX, CSV)
 */
export const getChartExportData = (
  title: string,
  chartData: { name: string; value: number }[],
): ExportData => ({
  fields: [title, translate('Count')],
  data: chartData.map((item) => [item.name, item.value]),
});
