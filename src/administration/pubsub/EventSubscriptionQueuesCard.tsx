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
        <Table density="compact" className="mb-0">
          <TableHeader>
            <TableRow divided={false} hoverable={false}>
              <TableHead className="text-quaternary">
                {translate('Object type')}
              </TableHead>
              <TableHead className="text-quaternary">
                {translate('Queue name')}
              </TableHead>
              <TableHead className="text-quaternary">
                {translate('Vhost')}
              </TableHead>
              <TableHead className="text-quaternary">
                {translate('Offering')}
              </TableHead>
              <TableHead className="text-quaternary">
                {translate('Created')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((queue) => (
              <TableRow key={queue.uuid} divided={false} hoverable={false}>
                <TableCell>{queue.object_type}</TableCell>
                <TableCell className="truncate max-w-[250px]">
                  {queue.queue_name}
                </TableCell>
                <TableCell className="text-quaternary">{queue.vhost}</TableCell>
                <TableCell
                  className="truncate text-quaternary max-w-[150px]"
                  title={queue.offering_uuid}
                >
                  {queue.offering_uuid}
                </TableCell>
                <TableCell className="text-quaternary">
                  {formatDateTime(queue.created)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <p className="text-quaternary mb-0">
          {translate('No event subscription queues found.')}
        </p>
      )}
    </AccordionCard>
  );
};
