import { CeleryWorkerStats } from 'waldur-js-client';

import { AccordionCard, Badge, PropertyItem, PropertyList } from 'waldur-ui';

import { translate } from '@/i18n';
import { propVal } from '@/property/propertyFields';

interface CeleryWorkerInfoProps {
  workerName: string;
  stats: CeleryWorkerStats;
}

export const CeleryWorkerInfo = ({
  workerName,
  stats,
}: CeleryWorkerInfoProps) => {
  const { pool, broker } = stats;
  const writesTotal =
    typeof pool.writes?.total === 'number' ? pool.writes.total : null;

  return (
    <AccordionCard
      title={workerName}
      actions={
        <Badge variant="success" tone="outline">
          {translate('Running')}
        </Badge>
      }
      className="mb-5"
      defaultOpen
    >
      <PropertyList>
        <PropertyItem label={translate('PID')} value={stats.pid} />
        <PropertyItem
          label={translate('Uptime')}
          value={propVal.duration(stats.uptime)}
        />
        <PropertyItem
          label={translate('Pool concurrency')}
          value={propVal.meter(pool.processes.length, pool.max_concurrency, {
            showPercent: true,
          })}
        />
        <PropertyItem
          label={translate('Prefetch count')}
          value={propVal.number(stats.prefetch_count)}
        />
        <PropertyItem
          label={translate('Broker')}
          value={`${broker.transport}://${broker.hostname}:${broker.port}${broker.virtual_host}`}
        />
        <PropertyItem
          label={translate('Broker SSL')}
          value={propVal.boolean(broker.ssl)}
        />
        {writesTotal !== null && (
          <PropertyItem
            label={translate('Tasks written')}
            value={propVal.count(writesTotal)}
          />
        )}
      </PropertyList>
    </AccordionCard>
  );
};
