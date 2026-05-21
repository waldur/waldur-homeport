import { FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { marketplaceServiceProvidersDestroy } from 'waldur-js-client';

import { translate } from '@/i18n';
import { ServiceProvider } from '@/marketplace/types';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionButton } from '@/table/ActionButton';
import { setCurrentCustomer } from '@/workspace/actions';
import { getCustomer } from '@/workspace/selectors';

interface DisableServiceProviderButtonProps {
  serviceProvider: ServiceProvider;
  setServiceProvider(data: ServiceProvider | null): void;
}

export const DisableServiceProviderButton: FC<
  DisableServiceProviderButtonProps
> = ({ serviceProvider, setServiceProvider }) => {
  const customer = useSelector(getCustomer);
  const dispatch = useDispatch();

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
      dispatch(
        setCurrentCustomer({
          ...customer,
          is_service_provider: false,
        }),
      );
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
