import { ShoppingCartIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { remoteWaldurApiPullOfferingOrders } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';

export const PullRemoteOfferingOrdersAction: FC<{ offering: any }> = ({
  offering,
}) => {
  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () =>
      remoteWaldurApiPullOfferingOrders({ path: { uuid: offering.uuid } }),
    successMessage: translate(
      'Offering orders synchronization has been scheduled.',
    ),
    errorMessage: translate('Unable to synchronize offering orders.'),
  });

  return (
    <ActionItem
      title={translate('Pull orders')}
      action={mutate}
      iconNode={<ShoppingCartIcon weight="bold" />}
      disabled={isPending}
    />
  );
};
