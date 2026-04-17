import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import { Table } from 'react-bootstrap';

import { AccordionCard } from '@waldur/core/AccordionCard';
import { FAST_STALE_TIME } from '@waldur/core/constants';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';

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
      className="mb-6"
    >
      {isLoading ? (
        <div className="text-center py-4">
          <LoadingSpinner />
        </div>
      ) : data && data.top_queues_by_messages.length > 0 ? (
        <Table size="sm" borderless className="mb-0">
          <thead>
            <tr>
              <th className="text-muted">{translate('Vhost')}</th>
              <th className="text-muted">{translate('Queue name')}</th>
              <th className="text-muted text-end">{translate('Messages')}</th>
              <th className="text-muted text-end">{translate('Consumers')}</th>
            </tr>
          </thead>
          <tbody>
            {data.top_queues_by_messages.map((queue, index) => (
              <tr key={index}>
                <td className="text-muted">{queue.vhost}</td>
                <td className="text-truncate" style={{ maxWidth: '250px' }}>
                  {queue.name}
                </td>
                <td
                  className={`fw-semibold text-end ${queue.messages > 1000 ? 'text-warning' : ''}`}
                >
                  {formatNumber(queue.messages)}
                </td>
                <td className="fw-semibold text-end">{queue.consumers}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <p className="text-muted mb-0">{translate('No queues found.')}</p>
      )}
    </AccordionCard>
  );
};
