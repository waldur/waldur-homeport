import { WarningCircleIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { Alert } from 'react-bootstrap';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { Panel } from '@waldur/core/Panel';
import { translate } from '@waldur/i18n';
import { RefreshButton } from '@waldur/marketplace/common/RefreshButton';

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
        <Alert variant="danger" className="d-flex align-items-center mb-0">
          <WarningCircleIcon size={24} weight="bold" className="me-3" />
          <div>
            <strong>{translate('Failed to load database statistics')}</strong>
            <p className="mb-0 mt-1">{errorMessage}</p>
          </div>
        </Alert>
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
