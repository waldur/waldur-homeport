import { PlayIcon } from '@phosphor-icons/react';
import { paymentProfilesEnable } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';
import { useCustomer, useSetCustomer } from '@/workspace/hooks';

import { getCustomer as getCustomerApi } from '../utils';

export const PaymentProfileEnableButton = (props) => {
  const setCurrentCustomer = useSetCustomer();
  const customer = useCustomer();

  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () => paymentProfilesEnable({ path: { uuid: props.row.uuid } }),
    refetch: props.refetch,
    successMessage: translate('Payment profile has been enabled.'),
    errorMessage: translate('Unable to enable payment profile.'),
    onSuccess: async () => {
      const updatedCustomer = await getCustomerApi(customer.uuid);
      setCurrentCustomer(updatedCustomer);
    },
  });

  if (props.row.is_active) {
    return null;
  }
  return (
    <ActionItem
      title={translate('Enable')}
      action={mutate}
      disabled={isPending}
      iconNode={<PlayIcon weight="bold" />}
      {...props.tooltipAndDisabledAttributes}
    />
  );
};
