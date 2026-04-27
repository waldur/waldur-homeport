import { WarningCircleIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { Alert } from 'react-bootstrap';

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
    <Alert variant="warning" className="d-flex align-items-start mb-6">
      <WarningCircleIcon
        size={24}
        weight="bold"
        className="me-3 mt-1 flex-shrink-0"
      />
      <div>
        <strong>{translate('Growth alerts')}</strong>
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
                  : translate('Monthly: {actual}% (threshold: {threshold}%)', {
                      actual: alert.actual.toFixed(1),
                      threshold: alert.threshold,
                    })}
              </span>
            ))}
          </div>
        ))}
      </div>
    </Alert>
  );
};
