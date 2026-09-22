import { useQuery } from '@tanstack/react-query';

import { AlertItem } from 'waldur-ui';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { Panel } from '@/core/Panel';
import { translate } from '@/i18n';
import { RefreshButton } from '@/marketplace/common/RefreshButton';

import { getDatabaseStats } from './api';
import { DatabaseActiveQueries } from './DatabaseActiveQueries';
import { DatabaseCacheCard } from './DatabaseCacheCard';
import { DatabaseConnectionsCard } from './DatabaseConnectionsCard';
import { DatabaseLocksCard } from './DatabaseLocksCard';
import { DatabaseMaintenanceCard } from './DatabaseMaintenanceCard';
import { DatabaseOverviewCards } from './DatabaseOverviewCards';
import { DatabaseQueryPerformanceCard } from './DatabaseQueryPerformanceCard';
import { DatabaseReplicationCard } from './DatabaseReplicationCard';
import { DatabaseTableStats } from './DatabaseTableStats';
import { DatabaseTransactionsCard } from './DatabaseTransactionsCard';

export const DatabaseStatsPage = () => {
  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ['DatabaseStats'],
    queryFn: getDatabaseStats,
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });

  if (isLoading || !data) {
    return (
      <Panel title={translate('Database statistics')} cardBordered>
        <div className="text-center py-10">
          <LoadingSpinner />
          <p className="text-muted mt-4">
            {translate('Fetching database statistics, please standby...')}
          </p>
        </div>
      </Panel>
    );
  }

  if (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    return (
      <Panel title={translate('Database statistics')} cardBordered>
        <AlertItem
          variant="error"
          type="floating"
          title={translate('Failed to load database statistics')}
          body={errorMessage}
          className="mb-0"
        />
      </Panel>
    );
  }

  const panelActions = (
    <RefreshButton refetch={refetch} isLoading={isRefetching} />
  );

  return (
    <Panel
      title={translate('Database statistics')}
      actions={panelActions}
      cardBordered
    >
      <DatabaseOverviewCards data={data} />
      <DatabaseConnectionsCard data={data.connections} />
      <DatabaseCacheCard data={data.cache_performance} />
      <DatabaseMaintenanceCard data={data.maintenance} />
      <DatabaseActiveQueries data={data.active_queries} />
      <DatabaseLocksCard data={data.locks} />
      <DatabaseTransactionsCard data={data.transactions} />
      <DatabaseQueryPerformanceCard data={data.query_performance} />
      <DatabaseReplicationCard data={data.replication} />
      <DatabaseTableStats data={data.table_stats} />
    </Panel>
  );
};
