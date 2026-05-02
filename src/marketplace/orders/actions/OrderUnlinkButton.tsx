import { marketplaceOrdersUnlink } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';

export const OrderUnlinkButton = ({ row, refetch }) => {
  const unlinkMutation = useManagedMutation<any, any, void>({
    mutationFn: () => marketplaceOrdersUnlink({ path: { uuid: row.uuid } }),
    successMessage: translate('Order has been unlinked.'),
    errorMessage: translate('Unable to unlink order.'),
    refetch,
    confirmation: {
      title: translate('Confirmation'),
      body: translate(
        'Are you sure you want to unlink the order? Unlinking will only remove object from the database, it will not trigger any cleanup',
      ),
    },
  });
  return (
    <RemovalActionItem
      title={translate('Unlink')}
      action={() => unlinkMutation.mutate()}
      disabled={unlinkMutation.isPending}
    />
  );
};
