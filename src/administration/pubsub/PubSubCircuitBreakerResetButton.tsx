import { ArrowCounterClockwiseIcon, WarningIcon } from '@phosphor-icons/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FC, useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { SubmitButton } from '@/form/SubmitButton';
import { translate } from '@/i18n';
import { waitForConfirmation } from '@/modal/actions';
import { showError, showSuccess } from '@/store/notify';

import { resetCircuitBreaker } from './api';
import { formatCircuitBreakerState } from './utils';

interface PubSubCircuitBreakerResetButtonProps {
  currentState: string;
}

export const PubSubCircuitBreakerResetButton: FC<
  PubSubCircuitBreakerResetButtonProps
> = ({ currentState }) => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: resetCircuitBreaker,
    onSuccess: () => {
      dispatch(showSuccess(translate('Circuit breaker has been reset.')));
      queryClient.invalidateQueries({ queryKey: ['PubSubOverview'] });
      queryClient.invalidateQueries({ queryKey: ['PubSubCircuitBreaker'] });
    },
    onError: (error) => {
      dispatch(
        showError(
          translate('Failed to reset circuit breaker: {error}', {
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
        translate('Reset circuit breaker'),
        <>
          <p>
            {translate('Current state: {state}', {
              state: formatCircuitBreakerState(currentState),
            })}
          </p>
          <p>
            {translate(
              'Resetting the circuit breaker will force it back to the CLOSED state, allowing messages to be published immediately.',
            )}
          </p>
          <p className="text-warning mb-0">
            {translate(
              'Only do this if you have confirmed that the underlying issue has been resolved.',
            )}
          </p>
        </>,
        {
          type: 'warning',
          iconNode: <WarningIcon weight="bold" />,
          positiveButton: translate('Reset circuit breaker'),
          positiveButtonVariant: 'warning',
        },
      );

      mutation.mutate();
    } catch {
      // User cancelled
    }
  }, [dispatch, currentState, mutation]);

  // Only show button when circuit breaker is not in CLOSED state
  if (currentState === 'closed') {
    return null;
  }

  return (
    <SubmitButton
      submitting={mutation.isPending}
      type="button"
      variant="warning"
      onClick={handleReset}
      label={translate('Reset circuit breaker')}
      iconNode={<ArrowCounterClockwiseIcon weight="bold" />}
      iconOnLeft
    />
  );
};
