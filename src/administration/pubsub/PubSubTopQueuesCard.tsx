import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';

import { AccordionCard } from 'waldur-ui';

import { FAST_STALE_TIME } from '@/core/constants';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';

import { getTopQueues } from './api';
import { formatNumber } from './utils';

export const PubSubTopQueuesCard: FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['PubSubTopQueues'],
    queryFn: getTopQueues,
    staleTime: FAST_STALE_TIME,
  });

  return (
    <AccordionCard
      id="pubsub-top-queues"
      title={translate('Top queues by messages')}
      subtitle={
        data
          ? translate('{count} queues, {messages} total messages', {
              count: data.total_queues,
              messages: formatNumber(data.total_messages),
            })
          : translate('Loading...')
      }
      defaultOpen={false}
      className="mb-5"
    >
      {isLoading ? (
        <div className="text-center py-3">
          <LoadingSpinner />
        </div>
      ) : data && data.top_queues_by_messages.length > 0 ? (
        <table className="table table-sm table-borderless mb-0">
          <thead>
            <tr>
              <th className="text-quaternary">{translate('Vhost')}</th>
              <th className="text-quaternary">{translate('Queue name')}</th>
              <th className="text-quaternary text-end">
                {translate('Messages')}
              </th>
              <th className="text-quaternary text-end">
                {translate('Consumers')}
              </th>
            </tr>
          </thead>
          <tbody>
            {data.top_queues_by_messages.map((queue, index) => (
              <tr key={index}>
                <td className="text-quaternary">{queue.vhost}</td>
                <td className="truncate" style={{ maxWidth: '250px' }}>
                  {queue.name}
                </td>
                <td
                  className={`text-end ${queue.messages > 1000 ? 'text-warning' : ''}`}
                >
                  {formatNumber(queue.messages)}
                </td>
                <td className="text-end">{queue.consumers}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-quaternary mb-0">{translate('No queues found.')}</p>
      )}
    </AccordionCard>
  );
};
