import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import { Table } from 'react-bootstrap';

import { AccordionCard, Badge } from 'waldur-ui';

import { FAST_STALE_TIME } from '@/core/constants';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';

import { getDeadLetterQueue } from './api';
import { formatNumber, getDlqLevel } from './utils';

export const PubSubDeadLetterQueueCard: FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['PubSubDeadLetterQueue'],
    queryFn: getDeadLetterQueue,
    staleTime: FAST_STALE_TIME,
  });

  const messageCount = data?.total_dlq_messages ?? 0;
  const health = getDlqLevel(messageCount);
  const hasMessages = messageCount > 0;

  return (
    <AccordionCard
      id="pubsub-dlq"
      title={translate('Dead letter queue')}
      subtitle={
        data
          ? translate('{count} messages', { count: messageCount })
          : translate('Loading...')
      }
      defaultOpen={hasMessages}
      className="mb-5"
    >
      {isLoading ? (
        <div className="text-center py-3">
          <LoadingSpinner />
        </div>
      ) : data ? (
        <>
          <Table
            size="sm"
            borderless
            className="mb-0"
            style={{ maxWidth: '400px' }}
          >
            <tbody>
              <tr>
                <td className="text-quaternary">
                  {translate('Total DLQ messages')}
                </td>
                <td className="text-end">
                  {data.total_dlq_messages > 0 ? (
                    <Badge
                      variant={health === 'danger' ? 'danger' : 'warning'}
                      shape="pill"
                      tone="outline"
                    >
                      {formatNumber(data.total_dlq_messages)}
                    </Badge>
                  ) : (
                    <span className="text-success">0</span>
                  )}
                </td>
              </tr>
              <tr>
                <td className="text-quaternary">{translate('DLQ count')}</td>
                <td className="text-end">{data.dlq_count}</td>
              </tr>
            </tbody>
          </Table>
          {data.dlq_queues && data.dlq_queues.length > 0 && (
            <>
              <h6 className="uppercase text-quaternary mt-3 mb-2.5">
                {translate('DLQ queues')}
              </h6>
              <Table size="sm" borderless className="mb-0">
                <thead>
                  <tr>
                    <th className="text-quaternary">{translate('Vhost')}</th>
                    <th className="text-quaternary">
                      {translate('Queue name')}
                    </th>
                    <th className="text-quaternary text-end">
                      {translate('Messages')}
                    </th>
                    <th className="text-quaternary text-end">
                      {translate('Consumers')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.dlq_queues.map((queue, index) => (
                    <tr key={index}>
                      <td className="text-quaternary">{queue.vhost}</td>
                      <td className="truncate" style={{ maxWidth: '250px' }}>
                        {queue.queue_name}
                      </td>
                      <td className="text-end text-warning">
                        {formatNumber(queue.messages)}
                      </td>
                      <td className="text-end">{queue.consumers}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </>
          )}
          {data.note && (
            <small className="text-quaternary mt-2.5 block">{data.note}</small>
          )}
          {hasMessages && (
            <small className="text-warning mt-2.5 block">
              {translate(
                'Messages in the dead letter queue indicate failed publishing attempts that need investigation.',
              )}
            </small>
          )}
        </>
      ) : (
        <p className="text-quaternary mb-0">
          {translate('Failed to load dead letter queue stats.')}
        </p>
      )}
    </AccordionCard>
  );
};
