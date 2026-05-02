import { UserCirclePlusIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { onboardingVerificationsCreateCustomer } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';

export const OnboardingVerificationCreateCustomer: FunctionComponent<{
  row;
  refetch;
}> = ({ row, refetch }) => {
  const createMutation = useManagedMutation<any, any, void>({
    mutationFn: () =>
      onboardingVerificationsCreateCustomer({
        path: { uuid: row.uuid },
      }),
    successMessage: translate(
      'Customer has been created from verification entry.',
    ),
    errorMessage: translate('Unable to create customer.'),
    refetch,
    confirmation: {
      title: translate('Create customer'),
      body: translate(
        'Are you sure you want to create a customer from this verification entry?',
      ),
    },
  });

  const callback = () => createMutation.mutateAsync();

  const isDisabled = row.status !== 'verified';

  return (
    <ActionItem
      title={translate('Create customer')}
      action={callback}
      iconNode={<UserCirclePlusIcon weight="bold" />}
      disabled={isDisabled || createMutation.isPending}
      tooltip={
        isDisabled
          ? translate('Customers can be created only from verified entries')
          : undefined
      }
    />
  );
};
