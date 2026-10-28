import { FC } from 'react';

import { AccordionCard, Progress } from 'waldur-ui';

import { translate } from '@/i18n';

import type { ConnectionStats } from './api';
import { getConnectionHealth } from './utils';

interface DatabaseConnectionsCardProps {
  data: ConnectionStats;
}

export const DatabaseConnectionsCard: FC<DatabaseConnectionsCardProps> = ({
  data,
}) => {
  const health = getConnectionHealth(data.utilization_percent);
  const progressVariant =
    health === 'danger'
      ? 'danger'
      : health === 'warning'
        ? 'warning'
        : 'success';

  return (
    <AccordionCard
      id="database-connections"
      title={translate('Connections')}
      subtitle={translate('{used} of {max} connections ({percent}%)', {
        used: data.active + data.idle,
        max: data.max_connections,
        percent: data.utilization_percent.toFixed(1),
      })}
      defaultOpen={health !== 'success'}
      className="mb-5"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-5">
        <div>
          <h6 className="uppercase text-quaternary mb-2.5">
            {translate('Connection breakdown')}
          </h6>
          <table className="table table-sm table-borderless mb-0">
            <tbody>
              <tr>
                <td className="text-quaternary">{translate('Active')}</td>
                <td className="text-end">{data.active.toLocaleString()}</td>
              </tr>
              <tr>
                <td className="text-quaternary">{translate('Idle')}</td>
                <td className="text-end">{data.idle.toLocaleString()}</td>
              </tr>
              <tr>
                <td className="text-quaternary">
                  {translate('Idle in transaction')}
                </td>
                <td
                  className={`text-end ${data.idle_in_transaction > 5 ? 'text-warning' : ''}`}
                >
                  {data.idle_in_transaction.toLocaleString()}
                </td>
              </tr>
              <tr>
                <td className="text-quaternary">{translate('Waiting')}</td>
                <td
                  className={`text-end ${data.waiting > 0 ? 'text-danger' : ''}`}
                >
                  {data.waiting.toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div>
          <h6 className="uppercase text-quaternary mb-2.5">
            {translate('Utilization')}
          </h6>
          <Progress
            size="lg"
            className="mb-2.5"
            label={translate('Connections')}
            segments={[
              {
                value: data.utilization_percent,
                variant: progressVariant,
                label: `${data.utilization_percent.toFixed(1)}%`,
              },
            ]}
          />
          <small className="text-quaternary">
            {translate('Max connections: {max}', { max: data.max_connections })}
          </small>
        </div>
      </div>
    </AccordionCard>
  );
};
