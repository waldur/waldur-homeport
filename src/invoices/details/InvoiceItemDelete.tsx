import { invoiceItemsDestroy } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';

export const InvoiceItemDelete = ({ item, refreshInvoiceItems }) => {
  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () => invoiceItemsDestroy({ path: { uuid: item.uuid } }),
    successMessage: translate('Invoice item has been removed.'),
    errorMessage: translate('Unable to delete invoice item.'),
    refetch: refreshInvoiceItems,
    confirmation: {
      title: translate('Confirmation'),
      body: translate('Are you sure you want to remove invoice item {name}?', {
        name: item.name,
      }),
    },
  });
  return (
    <RemovalActionItem
      action={mutate}
      disabled={isPending}
      title={translate('Remove')}
    />
  );
};
