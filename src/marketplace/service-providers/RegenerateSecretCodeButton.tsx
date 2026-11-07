import { ArrowsClockwiseIcon } from '@phosphor-icons/react';
import { useQueryClient } from '@tanstack/react-query';
import { FC } from 'react';
import {
  serviceProviderApiSecretCodeGenerate,
  ServiceProvider,
} from 'waldur-js-client';

import { CompactEditButton } from '@/form/CompactEditButton';
import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';

interface RegenerateSecretCodeButtonProps {
  serviceProvider: ServiceProvider;
}

export const RegenerateSecretCodeButton: FC<
  RegenerateSecretCodeButtonProps
> = ({ serviceProvider }) => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () =>
      serviceProviderApiSecretCodeGenerate({
        path: { uuid: serviceProvider.uuid },
      }).then((r) => r.data),
    successMessage: translate(
      'Service provider API secret code has been generated.',
    ),
    errorMessage: translate(
      'Unable to generate service provider API secret code.',
    ),
    closeModal: false,
    onSuccess: (data) => {
      queryClient.setQueryData(
        ['ServiceProviderSecretCode', serviceProvider?.uuid],
        data,
      );
    },
    confirmation: {
      title: translate('Regenerate secret API code'),
      body: translate(
        'After secret API code has been regenerated, it will not be possible to submit usage with the old key.',
      ),
      options: {
        type: 'warning',
        positiveButton: translate('Regenerate'),
        negativeButton: translate('Cancel'),
      },
    },
  });

  return (
    // The row's own action, as the pencil beside the other fields.
    <CompactEditButton
      iconNode={<ArrowsClockwiseIcon weight="bold" />}
      tooltip={translate('Regenerate API secret code')}
      onClick={() => mutate()}
      pending={isPending}
    />
  );
};
