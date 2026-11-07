import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';

import {
  AccordionCard,
  Badge,
  PropertyItem,
  PropertyList,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'waldur-ui';

import { FAST_STALE_TIME } from '@/core/constants';
import { formatCount } from '@/core/formatNumber';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { propVal } from '@/property/propertyFields';

import { getDeadLetterQueue } from './api';
import { getDlqLevel } from './utils';

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
          <PropertyList variant="compact" className="max-w-[400px]">
            <PropertyItem
              label={translate('Total DLQ messages')}
              value={
                data.total_dlq_messages > 0 ? (
                  <Badge
                    variant={health === 'danger' ? 'danger' : 'warning'}
                    shape="pill"
                    tone="outline"
                  >
                    {formatCount(data.total_dlq_messages)}
                  </Badge>
                ) : (
                  <span className="text-success">0</span>
                )
              }
            />
            <PropertyItem
              label={translate('DLQ count')}
              value={propVal.number(data.dlq_count)}
            />
          </PropertyList>
          {data.dlq_queues && data.dlq_queues.length > 0 && (
            <>
              <h6 className="uppercase text-quaternary mt-3 mb-2.5">
                {translate('DLQ queues')}
              </h6>
              <Table density="compact" className="mb-0">
                <TableHeader>
                  <TableRow divided={false} hoverable={false}>
                    <TableHead className="text-quaternary">
                      {translate('Vhost')}
                    </TableHead>
                    <TableHead className="text-quaternary">
                      {translate('Queue name')}
                    </TableHead>
                    <TableHead className="text-quaternary text-end">
                      {translate('Messages')}
                    </TableHead>
                    <TableHead className="text-quaternary text-end">
                      {translate('Consumers')}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.dlq_queues.map((queue, index) => (
                    <TableRow key={index} divided={false} hoverable={false}>
                      <TableCell className="text-quaternary">
                        {queue.vhost}
                      </TableCell>
                      <TableCell className="truncate max-w-[250px]">
                        {queue.queue_name}
                      </TableCell>
                      <TableCell className="text-end text-warning">
                        {formatCount(queue.messages)}
                      </TableCell>
                      <TableCell className="text-end">
                        {queue.consumers}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
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
