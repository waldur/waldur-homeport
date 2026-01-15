import { Eraser, Trash } from '@phosphor-icons/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FC, useCallback } from 'react';
import { Dropdown } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { showError, showSuccess } from '@waldur/store/notify';
import { TableDropdownToggle } from '@waldur/table/ActionsDropdown';

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
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const purgeMutation = useMutation({
    mutationFn: () => purgeRabbitMQQueues({ vhost, queue_name: queue.name }),
    onSuccess: (data) => {
      dispatch(
        showSuccess(
          translate('Purged {count} messages from queue', {
            count: data.purged_messages.toLocaleString(),
          }),
        ),
      );
      queryClient.invalidateQueries({ queryKey: ['RabbitMQStats'] });
    },
    onError: (error) => {
      dispatch(
        showError(
          translate('Failed to purge queue: {error}', {
            error: error instanceof Error ? error.message : String(error),
          }),
        ),
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () =>
      deleteRabbitMQQueues({
        vhost,
        queue_name: queue.name,
        delete_queue: true,
      }),
    onSuccess: () => {
      dispatch(showSuccess(translate('Queue deleted successfully')));
      queryClient.invalidateQueries({ queryKey: ['RabbitMQStats'] });
    },
    onError: (error) => {
      dispatch(
        showError(
          translate('Failed to delete queue: {error}', {
            error: error instanceof Error ? error.message : String(error),
          }),
        ),
      );
    },
  });

  const handlePurge = useCallback(async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Purge queue'),
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
        </>,
        {
          forDeletion: true,
          positiveButton: translate('Purge queue'),
        },
      );
      purgeMutation.mutate();
    } catch {
      // User cancelled
    }
  }, [dispatch, queue, purgeMutation]);

  const handleDelete = useCallback(async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Delete queue'),
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
        </>,
        {
          forDeletion: true,
          positiveButton: translate('Delete queue'),
        },
      );
      deleteMutation.mutate();
    } catch {
      // User cancelled
    }
  }, [dispatch, queue, deleteMutation]);

  const isPending = purgeMutation.isPending || deleteMutation.isPending;

  return (
    <Dropdown>
      <TableDropdownToggle disabled={isPending} />
      <Dropdown.Menu>
        <Dropdown.Item onClick={handlePurge}>
          <Eraser size={18} weight="bold" className="me-2" />
          {translate('Purge messages')}
        </Dropdown.Item>
        <Dropdown.Divider />
        <Dropdown.Item onClick={handleDelete} className="text-danger">
          <Trash size={18} weight="bold" className="me-2" />
          {translate('Delete queue')}
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};
