import { WarningCircleIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { Alert } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { Panel } from '@waldur/core/Panel';
import { translate } from '@waldur/i18n';
import { RefreshButton } from '@waldur/marketplace/common/RefreshButton';
import { isStaff as isStaffSelector } from '@waldur/workspace/selectors';

import { getRabbitMQStats } from './api';
import { RabbitMQOverviewCards } from './RabbitMQOverviewCards';
import { RabbitMQPurgeAllButton } from './RabbitMQPurgeAllButton';
import { RabbitMQVhostList } from './RabbitMQVhostList';

export const RabbitMQPage = () => {
  const isStaff = useSelector(isStaffSelector);
  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ['RabbitMQStats'],
    queryFn: getRabbitMQStats,
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });

  if (isLoading || !data) {
    return (
      <Panel title={translate('RabbitMQ subscription queues')} cardBordered>
        <div className="text-center py-10">
          <LoadingSpinner />
          <p className="text-muted mt-4">
            {translate('Fetching RabbitMQ statistics, please standby...')}
          </p>
        </div>
      </Panel>
    );
  }

  if (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const is503 = errorMessage.includes('503');

    return (
      <Panel title={translate('RabbitMQ subscription queues')} cardBordered>
        <Alert variant="danger" className="d-flex align-items-center mb-0">
          <WarningCircleIcon size={24} weight="bold" className="me-3" />
          <div>
            <strong>
              {is503
                ? translate('RabbitMQ service unavailable')
                : translate('Failed to load RabbitMQ statistics')}
            </strong>
            <p className="mb-0 mt-1">
              {is503
                ? translate(
                    'The RabbitMQ management API is not responding. Please check that RabbitMQ is running.',
                  )
                : errorMessage}
            </p>
          </div>
        </Alert>
      </Panel>
    );
  }

  const panelActions = (
    <div className="d-flex align-items-center gap-4">
      <RefreshButton refetch={refetch} isLoading={isRefetching} />
      {isStaff && <RabbitMQPurgeAllButton data={data} />}
    </div>
  );

  return (
    <Panel
      title={translate('RabbitMQ subscription queues')}
      actions={panelActions}
      cardBordered
    >
      <RabbitMQOverviewCards data={data} />
      <RabbitMQVhostList data={data} />
    </Panel>
  );
};
