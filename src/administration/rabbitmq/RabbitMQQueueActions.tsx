import { EraserIcon, TrashIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { Dropdown } from 'react-bootstrap';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { useNotify } from '@/store/notify';
import { TableDropdownToggle } from '@/table/ActionsDropdown';

import {
  deleteRabbitMQQueues,
  purgeRabbitMQQueues,
  type RmqQueueStats,
} from './api';

interface RabbitMQQueueActionsProps {
  vhost: string;
  queue: RmqQueueStats;
}

export const RabbitMQQueueActions: FC<RabbitMQQueueActionsProps> = ({
  vhost,
  queue,
}) => {
  const { showSuccess } = useNotify();

  const { mutate: handlePurge, isPending: isPurging } = useManagedMutation<
    any,
    any,
    void
  >({
    mutationFn: () => purgeRabbitMQQueues({ vhost, queue_name: queue.name }),
    onSuccess: (data: any) => {
      showSuccess(
        translate('Purged {count} messages from queue', {
          count: data.purged_messages.toLocaleString(),
        }),
      );
    },
    invalidateQueries: [{ queryKey: ['RabbitMQStats'] }],
    confirmation: {
      title: translate('Purge queue'),
      body: (
        <>
          <p>{translate('Are you sure you want to purge this queue?')}</p>
          <p>
            <strong>{translate('Queue')}:</strong> <code>{queue.name}</code>
          </p>
          <p>
            <strong>{translate('Messages to delete')}:</strong>{' '}
            {queue.messages.toLocaleString()}
          </p>
          <p className="text-danger mb-0">
            {translate('This action cannot be undone.')}
          </p>
        </>
      ),
      options: {
        forDeletion: true,
        positiveButton: translate('Purge queue'),
      },
    },
  });

  const { mutate: handleDelete, isPending: isDeleting } = useManagedMutation<
    any,
    any,
    void
  >({
    mutationFn: () =>
      deleteRabbitMQQueues({
        vhost,
        queue_name: queue.name,
        delete_queue: true,
      }),
    successMessage: translate('Queue deleted successfully'),
    invalidateQueries: [{ queryKey: ['RabbitMQStats'] }],
    confirmation: {
      title: translate('Delete queue'),
      body: (
        <>
          <p className="text-danger fw-bold">
            {translate('Are you sure you want to DELETE this queue entirely?')}
          </p>
          <p>
            <strong>{translate('Queue')}:</strong> <code>{queue.name}</code>
          </p>
          <p>
            <strong>{translate('Messages')}:</strong>{' '}
            {queue.messages.toLocaleString()}
          </p>
          <p>
            <strong>{translate('Consumers')}:</strong> {queue.consumers}
          </p>
          <p className="text-danger mb-0">
            {translate(
              'This will permanently remove the queue and all its messages. Connected consumers will be disconnected.',
            )}
          </p>
        </>
      ),
      options: {
        forDeletion: true,
        positiveButton: translate('Delete queue'),
      },
    },
  });

  const isPending = isPurging || isDeleting;

  return (
    <Dropdown>
      <TableDropdownToggle disabled={isPending} />
      <Dropdown.Menu>
        <Dropdown.Item onClick={() => handlePurge()}>
          <EraserIcon size={18} weight="bold" className="me-2" />
          {translate('Purge messages')}
        </Dropdown.Item>
        <Dropdown.Divider />
        <Dropdown.Item onClick={() => handleDelete()} className="text-danger">
          <TrashIcon size={18} weight="bold" className="me-2" />
          {translate('Delete queue')}
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};
