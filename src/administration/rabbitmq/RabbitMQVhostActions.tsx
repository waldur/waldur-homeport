import { TrashIcon } from '@phosphor-icons/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FC, useCallback } from 'react';
import { Dropdown } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { showError, showSuccess } from '@waldur/store/notify';
import { TableDropdownToggle } from '@waldur/table/ActionsDropdown';

import { purgeRabbitMQQueues, type RmqVhostStats } from './api';

interface RabbitMQVhostActionsProps {
  vhost: RmqVhostStats;
}

const PRESET_PATTERNS = [
  { pattern: '*_resource', label: translate('All resource queues') },
  { pattern: '*_order', label: translate('All order queues') },
  { pattern: '*_user_role', label: translate('All user role queues') },
];

export const RabbitMQVhostActions: FC<RabbitMQVhostActionsProps> = ({
  vhost,
}) => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (pattern: string) =>
      purgeRabbitMQQueues({ vhost: vhost.name, queue_pattern: pattern }),
    onSuccess: (response) => {
      dispatch(
        showSuccess(
          translate('Purged {messages} messages from {queues} queues', {
            messages: response.data.purged_messages.toLocaleString(),
            queues: response.data.purged_queues,
          }),
        ),
      );
      queryClient.invalidateQueries({ queryKey: ['RabbitMQStats'] });
    },
    onError: (error) => {
      dispatch(
        showError(
          translate('Failed to purge queues: {error}', {
            error: error instanceof Error ? error.message : String(error),
          }),
        ),
      );
    },
  });

  const countMatchingQueues = useCallback(
    (pattern: string) => {
      const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
      return vhost.queues.filter((q) => regex.test(q.name)).length;
    },
    [vhost.queues],
  );

  const countMatchingMessages = useCallback(
    (pattern: string) => {
      const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
      return vhost.queues
        .filter((q) => regex.test(q.name))
        .reduce((sum, q) => sum + q.messages, 0);
    },
    [vhost.queues],
  );

  const handlePurgePattern = useCallback(
    async (pattern: string) => {
      const matchingQueues = countMatchingQueues(pattern);
      const matchingMessages = countMatchingMessages(pattern);

      if (matchingQueues === 0) {
        dispatch(showError(translate('No queues match this pattern')));
        return;
      }

      try {
        await waitForConfirmation(
          dispatch,
          translate('Purge queues by pattern'),
          <>
            <p>
              {translate(
                'Are you sure you want to purge queues matching pattern?',
              )}
            </p>
            <p>
              <strong>{translate('Vhost')}:</strong> <code>{vhost.name}</code>
            </p>
            <p>
              <strong>{translate('Pattern')}:</strong> <code>{pattern}</code>
            </p>
            <p>
              <strong>{translate('Matching queues')}:</strong> {matchingQueues}
            </p>
            <p>
              <strong>{translate('Total messages')}:</strong>{' '}
              {matchingMessages.toLocaleString()}
            </p>
            <p className="text-danger mb-0">
              {translate('This action cannot be undone.')}
            </p>
          </>,
          {
            forDeletion: true,
            positiveButton: translate('Purge matching queues'),
          },
        );
        mutation.mutate(pattern);
      } catch {
        // User cancelled
      }
    },
    [dispatch, vhost, mutation, countMatchingQueues, countMatchingMessages],
  );

  const hasAnyMatchingQueues = PRESET_PATTERNS.some(
    (preset) => countMatchingQueues(preset.pattern) > 0,
  );

  return (
    <Dropdown>
      <TableDropdownToggle
        disabled={mutation.isPending || !hasAnyMatchingQueues}
        tooltip={!hasAnyMatchingQueues}
      />
      <Dropdown.Menu>
        {PRESET_PATTERNS.map((preset) => {
          const count = countMatchingQueues(preset.pattern);
          return (
            <Dropdown.Item
              key={preset.pattern}
              onClick={() => handlePurgePattern(preset.pattern)}
              disabled={count === 0}
            >
              <TrashIcon size={18} weight="bold" className="me-2" />
              {preset.label}{' '}
              <span className="text-muted">({count} queues)</span>
            </Dropdown.Item>
          );
        })}
      </Dropdown.Menu>
    </Dropdown>
  );
};
