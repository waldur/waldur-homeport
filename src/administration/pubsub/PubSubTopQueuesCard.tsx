import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';

import {
  AccordionCard,
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

import { getTopQueues } from './api';

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
              messages: formatCount(data.total_messages),
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
            {data.top_queues_by_messages.map((queue, index) => (
              <TableRow key={index} divided={false} hoverable={false}>
                <TableCell className="text-quaternary">{queue.vhost}</TableCell>
                <TableCell className="truncate max-w-[250px]">
                  {queue.name}
                </TableCell>
                <TableCell
                  className={`text-end ${queue.messages > 1000 ? 'text-warning' : ''}`}
                >
                  {formatCount(queue.messages)}
                </TableCell>
                <TableCell className="text-end">{queue.consumers}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <p className="text-quaternary mb-0">{translate('No queues found.')}</p>
      )}
    </AccordionCard>
  );
};
