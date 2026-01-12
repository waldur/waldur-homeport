import { TrashIcon, WarningIcon } from '@phosphor-icons/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FC, useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { showError, showSuccess } from '@waldur/store/notify';

import { purgeRabbitMQQueues, type RmqStatsResponse } from './api';

interface RabbitMQPurgeAllButtonProps {
  data: RmqStatsResponse;
}

const CONFIRMATION_TEXT = 'PURGE ALL';

export const RabbitMQPurgeAllButton: FC<RabbitMQPurgeAllButtonProps> = ({
  data,
}) => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () =>
      purgeRabbitMQQueues({ purge_all_subscription_queues: true }),
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
          translate('Failed to purge all queues: {error}', {
            error: error instanceof Error ? error.message : String(error),
          }),
        ),
      );
    },
  });

  const handlePurgeAll = useCallback(async () => {
    try {
      const typedValue = await waitForConfirmation(
        dispatch,
        translate('WARNING: Mass queue purge'),
        <>
          <p className="text-danger fw-bold">
            {translate(
              'You are about to purge ALL subscription queues across ALL users.',
            )}
          </p>
          <p>
            <strong>{translate('Total queues')}:</strong> {data.total_queues}
          </p>
          <p>
            <strong>{translate('Total messages')}:</strong>{' '}
            {data.total_messages.toLocaleString()}
          </p>
          <p className="text-danger">
            {translate(
              'This action cannot be undone and may affect all site agent integrations.',
            )}
          </p>
          <p className="mb-0">
            {translate('Type "{text}" to confirm:', {
              text: CONFIRMATION_TEXT,
            })}
          </p>
        </>,
        {
          type: 'danger',
          iconNode: <WarningIcon weight="bold" />,
          positiveButton: translate('Purge all queues'),
          positiveButtonVariant: 'danger',
          showInput: true,
          inputRequired: true,
          inputPlaceholder: CONFIRMATION_TEXT,
        },
      );

      if (typedValue !== CONFIRMATION_TEXT) {
        dispatch(
          showError(
            translate('Confirmation text does not match. Expected "{text}"', {
              text: CONFIRMATION_TEXT,
            }),
          ),
        );
        return;
      }

      mutation.mutate();
    } catch {
      // User cancelled
    }
  }, [dispatch, data, mutation]);

  return (
    <button
      type="button"
      className="btn btn-danger d-flex align-items-center gap-2"
      onClick={handlePurgeAll}
      disabled={mutation.isPending || data.total_queues === 0}
    >
      <TrashIcon size={16} weight="bold" />
      {translate('Purge all queues')}
    </button>
  );
};
