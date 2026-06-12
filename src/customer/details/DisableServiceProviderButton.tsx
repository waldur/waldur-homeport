import { FC } from 'react';
import {
  marketplaceServiceProvidersDestroy,
  ServiceProvider,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionButton } from '@/table/ActionButton';
import { useCustomer, useSetCustomer } from '@/workspace/hooks';

interface DisableServiceProviderButtonProps {
  serviceProvider: ServiceProvider;
  setServiceProvider(data: ServiceProvider | null): void;
}

export const DisableServiceProviderButton: FC<
  DisableServiceProviderButtonProps
> = ({ serviceProvider, setServiceProvider }) => {
  const customer = useCustomer();
  const setCurrentCustomer = useSetCustomer();

  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () =>
      marketplaceServiceProvidersDestroy({
        path: { uuid: serviceProvider.uuid },
      }),
    successMessage: translate('Service provider profile has been disabled.'),
    errorMessage: translate('Unable to disable service provider profile.'),
    closeModal: false,
    onSuccess: () => {
      setServiceProvider(null);
      setCurrentCustomer({
        ...customer,
        is_service_provider: false,
      });
    },
    confirmation: {
      title: translate('Disable service provider profile'),
      body: translate(
        'Are you sure you want to remove service provider profile?',
      ),
      options: { forDeletion: true },
    },
  });

  return (
    <ActionButton
      title={translate('Disable service provider profile')}
      action={() => mutate()}
      variant="danger"
      pending={isPending}
    />
  );
};
