import { CeleryWorkerStats } from 'waldur-js-client';

import { AccordionCard } from '@/core/AccordionCard';
import { Badge } from '@/core/Badge';
import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';

interface CeleryWorkerInfoProps {
  workerName: string;
  stats: CeleryWorkerStats;
}

const formatUptime = (seconds: number): string => {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0 || parts.length === 0) parts.push(`${minutes}m`);

  return parts.join(' ');
};

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
        <Badge variant="success" light>
          {translate('Running')}
        </Badge>
      }
      className="mb-6"
      defaultOpen
    >
      <FormTable>
        <FormTable.Item label={translate('PID')} value={stats.pid} />
        <FormTable.Item
          label={translate('Uptime')}
          value={formatUptime(stats.uptime)}
        />
        <FormTable.Item
          label={translate('Pool concurrency')}
          value={`${pool.processes.length} / ${pool.max_concurrency}`}
        />
        <FormTable.Item
          label={translate('Prefetch count')}
          value={stats.prefetch_count}
        />
        <FormTable.Item
          label={translate('Broker')}
          value={`${broker.transport}://${broker.hostname}:${broker.port}${broker.virtual_host}`}
        />
        <FormTable.Item
          label={translate('Broker SSL')}
          value={broker.ssl ? translate('Yes') : translate('No')}
        />
        {writesTotal !== null && (
          <FormTable.Item
            label={translate('Tasks written')}
            value={writesTotal.toLocaleString()}
          />
        )}
      </FormTable>
    </AccordionCard>
  );
};
