import { WarningCircleIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { Alert } from 'react-bootstrap';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { Panel } from '@waldur/core/Panel';
import { translate } from '@waldur/i18n';
import { RefreshButton } from '@waldur/marketplace/common/RefreshButton';

import { getTableGrowth } from './api';
import { TableGrowthAlerts } from './TableGrowthAlerts';
import { TableGrowthOverview } from './TableGrowthOverview';
import { TableGrowthTable } from './TableGrowthTable';
import { deriveAlerts } from './utils';

export const TableGrowthPage = () => {
  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ['TableGrowth'],
    queryFn: getTableGrowth,
    refetchInterval: 60000,
  });

  const alerts = useMemo(() => (data ? deriveAlerts(data) : []), [data]);

  if (isLoading || !data) {
    return (
      <Panel title={translate('Table growth monitoring')} cardBordered>
        <div className="text-center py-10">
          <LoadingSpinner />
          <p className="text-muted mt-4">
            {translate('Fetching table growth statistics, please standby...')}
          </p>
        </div>
      </Panel>
    );
  }

  if (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    return (
      <Panel title={translate('Table growth monitoring')} cardBordered>
        <Alert variant="danger" className="d-flex align-items-center mb-0">
          <WarningCircleIcon size={24} weight="bold" className="me-3" />
          <div>
            <strong>
              {translate('Failed to load table growth statistics')}
            </strong>
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
      title={translate('Table growth monitoring')}
      actions={panelActions}
      cardBordered
    >
      <TableGrowthOverview data={data} alerts={alerts} />
      <TableGrowthAlerts alerts={alerts} />
      <TableGrowthTable data={data} alerts={alerts} />
    </Panel>
  );
};
