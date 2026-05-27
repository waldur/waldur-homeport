import { paymentProfilesDestroy } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';
import { useCustomer, useSetCustomer } from '@/workspace/hooks';

import { getCustomer as getCustomerApi } from '../utils';

export const PaymentProfileDeleteButton = (props) => {
  const setCurrentCustomer = useSetCustomer();
  const customer = useCustomer();

  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () =>
      paymentProfilesDestroy({ path: { uuid: props.row.uuid } }),
    successMessage: translate('Payment profile has been removed.'),
    errorMessage: translate('Unable to remove payment profile.'),
    refetch: props.refetch,
    onSuccess: async () => {
      const updatedCustomer = await getCustomerApi(customer.uuid);
      setCurrentCustomer(updatedCustomer);
    },
    confirmation: {
      title: translate('Confirmation'),
      body: translate('Are you sure you want to delete the payment profile?'),
      options: { forDeletion: true },
    },
  });

  return (
    <RemovalActionItem
      title={translate('Delete')}
      action={mutate}
      disabled={isPending || props.tooltipAndDisabledAttributes?.disabled}
      {...props.tooltipAndDisabledAttributes}
    />
  );
};
