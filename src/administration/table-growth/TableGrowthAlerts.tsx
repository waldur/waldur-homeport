import { FC } from 'react';

import { AlertItem } from 'waldur-ui';

import { translate } from '@/i18n';

import type { TableAlert } from './utils';

interface TableGrowthAlertsProps {
  alerts: TableAlert[];
}

export const TableGrowthAlerts: FC<TableGrowthAlertsProps> = ({ alerts }) => {
  if (alerts.length === 0) return null;

  const grouped = alerts.reduce(
    (acc, alert) => {
      if (!acc[alert.table_name]) {
        acc[alert.table_name] = [];
      }
      acc[alert.table_name].push(alert);
      return acc;
    },
    {} as Record<string, TableAlert[]>,
  );

  return (
    <AlertItem
      variant="warning"
      className="mb-6"
      title={translate('Growth alerts')}
      body={
        <div>
          {Object.entries(grouped).map(([tableName, tableAlerts]) => (
            <div key={tableName} className="mt-2">
              <code>{tableName}</code>
              {tableAlerts.map((alert) => (
                <span key={alert.period} className="ms-2 text-muted">
                  {alert.period === 'weekly'
                    ? translate('Weekly: {actual}% (threshold: {threshold}%)', {
                        actual: alert.actual.toFixed(1),
                        threshold: alert.threshold,
                      })
                    : translate(
                        'Monthly: {actual}% (threshold: {threshold}%)',
                        {
                          actual: alert.actual.toFixed(1),
                          threshold: alert.threshold,
                        },
                      )}
                </span>
              ))}
            </div>
          ))}
        </div>
      }
    />
  );
};
