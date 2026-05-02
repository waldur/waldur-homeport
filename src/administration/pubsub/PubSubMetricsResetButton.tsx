import { ArrowCounterClockwiseIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { SubmitButton } from '@/form/SubmitButton';
import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';

import { resetPubSubMetrics } from './api';

export const PubSubMetricsResetButton: FC = () => {
  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: resetPubSubMetrics,
    invalidateQueries: [
      { queryKey: ['PubSubOverview'] },
      { queryKey: ['PubSubMetrics'] },
    ],
    successMessage: translate('Metrics have been reset.'),
    errorMessage: translate('Unable to reset metrics.'),
    confirmation: {
      title: translate('Reset metrics'),
      body: (
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
        </>
      ),
      options: {
        type: 'primary',
        positiveButton: translate('Reset metrics'),
        positiveButtonVariant: 'primary',
      },
    },
  });

  return (
    <SubmitButton
      submitting={isPending}
      type="button"
      variant="secondary"
      onClick={() => mutate()}
      label={translate('Reset metrics')}
      iconNode={<ArrowCounterClockwiseIcon weight="bold" />}
      iconOnLeft
    />
  );
};
