import { ArrowCounterClockwise } from '@phosphor-icons/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FC, useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { SubmitButton } from '@waldur/form/SubmitButton';
import { translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { showError, showSuccess } from '@waldur/store/notify';

import { resetPubSubMetrics } from './api';

export const PubSubMetricsResetButton: FC = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: resetPubSubMetrics,
    onSuccess: () => {
      dispatch(showSuccess(translate('Metrics have been reset.')));
      queryClient.invalidateQueries({ queryKey: ['PubSubOverview'] });
      queryClient.invalidateQueries({ queryKey: ['PubSubMetrics'] });
    },
    onError: (error) => {
      dispatch(
        showError(
          translate('Failed to reset metrics: {error}', {
            error: error instanceof Error ? error.message : String(error),
          }),
        ),
      );
    },
  });

  const handleReset = useCallback(async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Reset metrics'),
        <>
          <p>
            {translate(
              'This will reset all publishing metrics counters to zero.',
            )}
          </p>
          <p className="mb-0">
            {translate(
              'This action is useful for starting fresh statistics after addressing issues.',
            )}
          </p>
        </>,
        {
          type: 'primary',
          positiveButton: translate('Reset metrics'),
          positiveButtonVariant: 'primary',
        },
      );

      mutation.mutate();
    } catch {
      // User cancelled
    }
  }, [dispatch, mutation]);

  return (
    <SubmitButton
      submitting={mutation.isPending}
      type="button"
      variant="secondary"
      onClick={handleReset}
      label={translate('Reset metrics')}
      iconNode={<ArrowCounterClockwise weight="bold" />}
      iconOnLeft
    />
  );
};
