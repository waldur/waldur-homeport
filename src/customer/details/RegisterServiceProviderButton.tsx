import { FC } from 'react';
import {
  marketplaceServiceProvidersCreate,
  ServiceProvider,
} from 'waldur-js-client';

import { BaseButton } from 'waldur-ui';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { useCustomer, useSetCustomer } from '@/workspace/hooks';

interface RegisterServiceProviderButtonProps {
  setServiceProvider(data: ServiceProvider | null): void;
}

export const RegisterServiceProviderButton: FC<
  RegisterServiceProviderButtonProps
> = ({ setServiceProvider }) => {
  const customer = useCustomer();
  const setCurrentCustomer = useSetCustomer();

  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () =>
      marketplaceServiceProvidersCreate({
        body: {
          customer: customer.url,
        },
      }).then((r) => r.data),
    successMessage: translate('Service provider has been registered.'),
    errorMessage: translate('Unable to register service provider.'),
    closeModal: false,
    onSuccess: (data) => {
      setServiceProvider(data);
      setCurrentCustomer({
        ...customer,
        is_service_provider: true,
      });
    },
  });

  return (
    <BaseButton
      label={translate('Register as service provider')}
      onClick={() => mutate()}
      variant="secondary"
      pending={isPending}
      size="lg"
    />
  );
};
