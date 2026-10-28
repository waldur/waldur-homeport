import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';

import { AccordionCard } from 'waldur-ui';

import { FAST_STALE_TIME } from '@/core/constants';
import { formatDateTime } from '@/core/dateUtils';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';

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
      title={translate('Legacy event subscription queues')}
      subtitle={
        data
          ? translate('{count} queues', { count: data.length })
          : translate('Loading...')
      }
      defaultOpen={false}
      className="mb-5"
    >
      {isLoading ? (
        <div className="text-center py-3">
          <LoadingSpinner />
        </div>
      ) : data && data.length > 0 ? (
        <table className="table table-sm table-borderless mb-0">
          <thead>
            <tr>
              <th className="text-quaternary">{translate('Object type')}</th>
              <th className="text-quaternary">{translate('Queue name')}</th>
              <th className="text-quaternary">{translate('Vhost')}</th>
              <th className="text-quaternary">{translate('Offering')}</th>
              <th className="text-quaternary">{translate('Created')}</th>
            </tr>
          </thead>
          <tbody>
            {data.map((queue) => (
              <tr key={queue.uuid}>
                <td>{queue.object_type}</td>
                <td className="truncate" style={{ maxWidth: '250px' }}>
                  {queue.queue_name}
                </td>
                <td className="text-quaternary">{queue.vhost}</td>
                <td
                  className="truncate text-quaternary"
                  style={{ maxWidth: '150px' }}
                  title={queue.offering_uuid}
                >
                  {queue.offering_uuid}
                </td>
                <td className="text-quaternary">
                  {formatDateTime(queue.created)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-quaternary mb-0">
          {translate('No event subscription queues found.')}
        </p>
      )}
    </AccordionCard>
  );
};
