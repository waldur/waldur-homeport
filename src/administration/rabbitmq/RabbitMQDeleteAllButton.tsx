import { Trash, Warning } from '@phosphor-icons/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FC, useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { showError, showSuccess } from '@waldur/store/notify';

import { deleteRabbitMQQueues, type RmqStatsResponse } from './api';

interface RabbitMQDeleteAllButtonProps {
  data: RmqStatsResponse;
}

const CONFIRMATION_TEXT = 'DELETE ALL';

export const RabbitMQDeleteAllButton: FC<RabbitMQDeleteAllButtonProps> = ({
  data,
}) => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () =>
      deleteRabbitMQQueues({ delete_all_subscription_queues: true }),
    onSuccess: (result) => {
      dispatch(
        showSuccess(
          translate('Deleted {count} queues', {
            count: result.deleted_queues,
          }),
        ),
      );
      queryClient.invalidateQueries({ queryKey: ['RabbitMQStats'] });
    },
    onError: (error) => {
      dispatch(
        showError(
          translate('Failed to delete all queues: {error}', {
            error: error instanceof Error ? error.message : String(error),
          }),
        ),
      );
    },
  });

  const handleDeleteAll = useCallback(async () => {
    try {
      const typedValue = await waitForConfirmation(
        dispatch,
        translate('WARNING: Mass queue deletion'),
        <>
          <p className="text-danger fw-bold">
            {translate(
              'You are about to DELETE ALL subscription queues across ALL users.',
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
              'This will permanently remove all queues and their messages. All site agent integrations will be disconnected.',
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
          iconNode: <Warning weight="bold" />,
          positiveButton: translate('Delete all queues'),
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
      onClick={handleDeleteAll}
      disabled={mutation.isPending || data.total_queues === 0}
    >
      <Trash size={16} weight="bold" />
      {translate('Delete all queues')}
    </button>
  );
};
