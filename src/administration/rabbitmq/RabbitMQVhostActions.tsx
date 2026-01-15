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
  type RmqVhostStats,
} from './api';

interface RabbitMQVhostActionsProps {
  vhost: RmqVhostStats;
}

const PRESET_PATTERNS = [
  { pattern: '*_resource', label: translate('resource queues') },
  { pattern: '*_order', label: translate('order queues') },
  { pattern: '*_user_role', label: translate('user role queues') },
];

export const RabbitMQVhostActions: FC<RabbitMQVhostActionsProps> = ({
  vhost,
}) => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const purgeMutation = useMutation({
    mutationFn: (pattern: string) =>
      purgeRabbitMQQueues({ vhost: vhost.name, queue_pattern: pattern }),
    onSuccess: (data) => {
      dispatch(
        showSuccess(
          translate('Purged {messages} messages from {queues} queues', {
            messages: data.purged_messages.toLocaleString(),
            queues: data.purged_queues,
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

  const deleteMutation = useMutation({
    mutationFn: (pattern: string) =>
      deleteRabbitMQQueues({
        vhost: vhost.name,
        queue_pattern: pattern,
        delete_queue: true,
      }),
    onSuccess: (data) => {
      dispatch(
        showSuccess(
          translate('Deleted {count} queues', {
            count: data.deleted_queues,
          }),
        ),
      );
      queryClient.invalidateQueries({ queryKey: ['RabbitMQStats'] });
    },
    onError: (error) => {
      dispatch(
        showError(
          translate('Failed to delete queues: {error}', {
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
        purgeMutation.mutate(pattern);
      } catch {
        // User cancelled
      }
    },
    [
      dispatch,
      vhost,
      purgeMutation,
      countMatchingQueues,
      countMatchingMessages,
    ],
  );

  const handleDeletePattern = useCallback(
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
          translate('Delete queues by pattern'),
          <>
            <p className="text-danger fw-bold">
              {translate(
                'Are you sure you want to DELETE queues matching pattern?',
              )}
            </p>
            <p>
              <strong>{translate('Vhost')}:</strong> <code>{vhost.name}</code>
            </p>
            <p>
              <strong>{translate('Pattern')}:</strong> <code>{pattern}</code>
            </p>
            <p>
              <strong>{translate('Queues to delete')}:</strong> {matchingQueues}
            </p>
            <p>
              <strong>{translate('Messages to lose')}:</strong>{' '}
              {matchingMessages.toLocaleString()}
            </p>
            <p className="text-danger mb-0">
              {translate(
                'This will permanently remove the queues and all their messages.',
              )}
            </p>
          </>,
          {
            forDeletion: true,
            positiveButton: translate('Delete matching queues'),
          },
        );
        deleteMutation.mutate(pattern);
      } catch {
        // User cancelled
      }
    },
    [
      dispatch,
      vhost,
      deleteMutation,
      countMatchingQueues,
      countMatchingMessages,
    ],
  );

  const hasAnyMatchingQueues = PRESET_PATTERNS.some(
    (preset) => countMatchingQueues(preset.pattern) > 0,
  );

  const isPending = purgeMutation.isPending || deleteMutation.isPending;

  return (
    <Dropdown>
      <TableDropdownToggle
        disabled={isPending || !hasAnyMatchingQueues}
        tooltip={!hasAnyMatchingQueues}
      />
      <Dropdown.Menu>
        <Dropdown.Header>{translate('Purge messages')}</Dropdown.Header>
        {PRESET_PATTERNS.map((preset) => {
          const count = countMatchingQueues(preset.pattern);
          return (
            <Dropdown.Item
              key={`purge-${preset.pattern}`}
              onClick={() => handlePurgePattern(preset.pattern)}
              disabled={count === 0}
            >
              <Eraser size={18} weight="bold" className="me-2" />
              {translate('Purge {label}', { label: preset.label })}{' '}
              <span className="text-muted">({count})</span>
            </Dropdown.Item>
          );
        })}
        <Dropdown.Divider />
        <Dropdown.Header>{translate('Delete queues')}</Dropdown.Header>
        {PRESET_PATTERNS.map((preset) => {
          const count = countMatchingQueues(preset.pattern);
          return (
            <Dropdown.Item
              key={`delete-${preset.pattern}`}
              onClick={() => handleDeletePattern(preset.pattern)}
              disabled={count === 0}
              className="text-danger"
            >
              <Trash size={18} weight="bold" className="me-2" />
              {translate('Delete {label}', { label: preset.label })}{' '}
              <span className="text-muted">({count})</span>
            </Dropdown.Item>
          );
        })}
      </Dropdown.Menu>
    </Dropdown>
  );
};
