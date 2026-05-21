import { FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { marketplaceServiceProvidersCreate } from 'waldur-js-client';

import { translate } from '@/i18n';
import { ServiceProvider } from '@/marketplace/types';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionButton } from '@/table/ActionButton';
import { setCurrentCustomer } from '@/workspace/actions';
import { getCustomer } from '@/workspace/selectors';

interface RegisterServiceProviderButtonProps {
  setServiceProvider(data: ServiceProvider | null): void;
}

export const RegisterServiceProviderButton: FC<
  RegisterServiceProviderButtonProps
> = ({ setServiceProvider }) => {
  const customer = useSelector(getCustomer);
  const dispatch = useDispatch();

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
      dispatch(
        setCurrentCustomer({
          ...customer,
          is_service_provider: true,
        }),
      );
    },
  });

  return (
    <ActionButton
      title={translate('Register as service provider')}
      action={() => mutate()}
      variant="secondary"
      pending={isPending}
    />
  );
};
