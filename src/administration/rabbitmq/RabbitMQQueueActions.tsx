import { TrashIcon } from '@phosphor-icons/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FC, useCallback } from 'react';
import { Dropdown } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { showError, showSuccess } from '@waldur/store/notify';
import { TableDropdownToggle } from '@waldur/table/ActionsDropdown';

import { purgeRabbitMQQueues, type RmqQueueStats } from './api';

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

  const mutation = useMutation({
    mutationFn: () => purgeRabbitMQQueues({ vhost, queue_name: queue.name }),
    onSuccess: (response) => {
      dispatch(
        showSuccess(
          translate('Purged {count} messages from queue', {
            count: response.data.purged_messages.toLocaleString(),
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
      mutation.mutate();
    } catch {
      // User cancelled
    }
  }, [dispatch, queue, mutation]);

  return (
    <Dropdown>
      <TableDropdownToggle disabled={mutation.isPending} />
      <Dropdown.Menu>
        <Dropdown.Item onClick={handlePurge}>
          <TrashIcon size={18} weight="bold" className="me-2" />
          {translate('Purge queue')}
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};
