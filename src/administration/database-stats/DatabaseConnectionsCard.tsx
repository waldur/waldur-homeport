import { FC } from 'react';

import { AccordionCard, Progress, PropertyList, PropertyItem } from 'waldur-ui';

import { translate } from '@/i18n';
import { propVal } from '@/property/propertyFields';

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
          <PropertyList variant="compact">
            <PropertyList.Section title={translate('Connection breakdown')}>
              <PropertyItem
                label={translate('Active')}
                value={propVal.count(data.active)}
              />
              <PropertyItem
                label={translate('Idle')}
                value={propVal.count(data.idle)}
              />
              <PropertyItem
                label={translate('Idle in transaction')}
                value={propVal.count(data.idle_in_transaction)}
                valueClass={
                  data.idle_in_transaction > 5 ? 'text-warning' : undefined
                }
              />
              <PropertyItem
                label={translate('Waiting')}
                value={propVal.count(data.waiting)}
                valueClass={data.waiting > 0 ? 'text-danger' : undefined}
              />
            </PropertyList.Section>
          </PropertyList>
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
