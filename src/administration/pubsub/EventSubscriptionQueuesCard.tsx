import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import { Table } from 'react-bootstrap';

import { AccordionCard } from '@waldur/core/AccordionCard';
import { FAST_STALE_TIME } from '@waldur/core/constants';
import { formatDateTime } from '@waldur/core/dateUtils';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';

import { getEventSubscriptionQueues } from './api';

export const EventSubscriptionQueuesCard: FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['EventSubscriptionQueues'],
    queryFn: getEventSubscriptionQueues,
    staleTime: FAST_STALE_TIME,
  });

  return (
    <AccordionCard
      id="event-subscription-queues"
      title={translate('Event subscription queues')}
      subtitle={
        data
          ? translate('{count} queues', { count: data.length })
          : translate('Loading...')
      }
      defaultOpen={false}
      className="mb-6"
    >
      {isLoading ? (
        <div className="text-center py-4">
          <LoadingSpinner />
        </div>
      ) : data && data.length > 0 ? (
        <Table size="sm" borderless className="mb-0">
          <thead>
            <tr>
              <th className="text-muted">{translate('Object type')}</th>
              <th className="text-muted">{translate('Queue name')}</th>
              <th className="text-muted">{translate('Vhost')}</th>
              <th className="text-muted">{translate('Offering')}</th>
              <th className="text-muted">{translate('Created')}</th>
            </tr>
          </thead>
          <tbody>
            {data.map((queue) => (
              <tr key={queue.uuid}>
                <td>{queue.object_type}</td>
                <td className="text-truncate" style={{ maxWidth: '250px' }}>
                  {queue.queue_name}
                </td>
                <td className="text-muted">{queue.vhost}</td>
                <td
                  className="text-truncate text-muted"
                  style={{ maxWidth: '150px' }}
                  title={queue.offering_uuid}
                >
                  {queue.offering_uuid}
                </td>
                <td className="text-muted">{formatDateTime(queue.created)}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <p className="text-muted mb-0">
          {translate('No event subscription queues found.')}
        </p>
      )}
    </AccordionCard>
  );
};
