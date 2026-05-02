import { invoiceItemsDestroy } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { useNotify } from '@/store/notify';
import { RemovalActionButton } from '@/table/RemovalActionButton';
import { useUser } from '@/workspace/hooks';

import { InvoiceTableItem } from '../types';

export const InvoiceItemsBulkDelete = ({
  rows,
  refetch,
}: {
  rows: InvoiceTableItem[];
  refetch(): void;
}) => {
  const { showErrorResponse } = useNotify();

  const user = useUser();
  if (!user.is_staff) {
    return null;
  }

  const allItems = rows.flatMap((row) => row.items);

  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: async () => {
      for (const item of allItems) {
        try {
          await invoiceItemsDestroy({ path: { uuid: item.uuid } });
        } catch (e) {
          showErrorResponse(
            e,
            translate('Unable to delete invoice item {name}.', {
              name: item.name,
            }),
          );
        }
      }
    },
    confirmation: {
      title: translate('Remove invoice items'),
      body: (
        <div>
          <p>
            {translate(
              'Are you sure you want to remove {count} invoice item(s)?',
              { count: allItems.length },
            )}
          </p>
          <ul>
            {allItems.map((item) => (
              <li key={item.uuid}>{item.name}</li>
            ))}
          </ul>
        </div>
      ),
      options: { forDeletion: true },
    },
    successMessage: translate('Invoice items have been removed.'),
    errorMessage: translate('Unable to delete invoice items.'),
    refetch,
  });

  return (
    <RemovalActionButton
      title={translate('Remove')}
      action={mutate}
      disabled={isPending}
      disabledReason={translate('Deletion in progress')}
    />
  );
};
