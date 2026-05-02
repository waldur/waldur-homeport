import { ArrowCounterClockwiseIcon, WarningIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { SubmitButton } from '@/form/SubmitButton';
import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';

import { resetCircuitBreaker } from './api';
import { formatCircuitBreakerState } from './utils';

interface PubSubCircuitBreakerResetButtonProps {
  currentState: string;
}

export const PubSubCircuitBreakerResetButton: FC<
  PubSubCircuitBreakerResetButtonProps
> = ({ currentState }) => {
  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: resetCircuitBreaker,
    successMessage: translate('Circuit breaker has been reset.'),
    errorMessage: translate('Failed to reset circuit breaker.'),

    confirmation: {
      title: translate('Reset circuit breaker'),
      body: (
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
        </>
      ),
      options: {
        type: 'warning',
        iconNode: <WarningIcon weight="bold" />,
        positiveButton: translate('Reset circuit breaker'),
        positiveButtonVariant: 'warning',
      },
    },

    invalidateQueries: [
      { queryKey: ['PubSubOverview'] },
      { queryKey: ['PubSubCircuitBreaker'] },
    ],
  });

  // Only show button when circuit breaker is not in CLOSED state
  if (currentState === 'closed') {
    return null;
  }

  return (
    <SubmitButton
      submitting={isPending}
      type="button"
      variant="warning"
      onClick={() => mutate()}
      label={translate('Reset circuit breaker')}
      iconNode={<ArrowCounterClockwiseIcon weight="bold" />}
      iconOnLeft
    />
  );
};
