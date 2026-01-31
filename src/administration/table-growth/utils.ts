import type { TableGrowthStatsResponse } from './api';

export const getGrowthClass = (
  value: number | null,
  threshold: number,
): string => {
  if (value == null) return 'text-muted';
  if (value < 0) return 'text-success';
  if (value > threshold) return 'text-danger fw-bold';
  return '';
};

export const formatGrowthPercent = (value: number | null): string => {
  if (value == null) return '--';
  return `${value.toFixed(1)}%`;
};

export interface TableAlert {
  table_name: string;
  period: 'weekly' | 'monthly';
  actual: number;
  threshold: number;
}

export const deriveAlerts = (data: TableGrowthStatsResponse): TableAlert[] => {
  const alerts: TableAlert[] = [];
  for (const table of data.tables) {
    if (
      table.weekly_growth_percent != null &&
      table.weekly_growth_percent > data.weekly_threshold_percent
    ) {
      alerts.push({
        table_name: table.table_name,
        period: 'weekly',
        actual: table.weekly_growth_percent,
        threshold: data.weekly_threshold_percent,
      });
    }
    if (
      table.monthly_growth_percent != null &&
      table.monthly_growth_percent > data.monthly_threshold_percent
    ) {
      alerts.push({
        table_name: table.table_name,
        period: 'monthly',
        actual: table.monthly_growth_percent,
        threshold: data.monthly_threshold_percent,
      });
    }
  }
  return alerts;
};

export const getAlertedTableNames = (alerts: TableAlert[]): Set<string> =>
  new Set(alerts.map((a) => a.table_name));
