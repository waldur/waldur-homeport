import { FileTextIcon } from '@phosphor-icons/react';
import { paymentsUnlinkFromInvoice } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';
import { useUser } from '@/workspace/hooks';

export const UnlinkInvoiceButton = ({ row: payment, refetch }) => {
  const user = useUser();

  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () =>
      paymentsUnlinkFromInvoice({ path: { uuid: payment.uuid } }),
    refetch,
    successMessage: translate(
      'Invoice has been successfully unlinked from payment.',
    ),
    errorMessage: translate('Unable to unlink invoice from the payment.'),
  });

  return (
    <ActionItem
      title={translate('Unlink invoice')}
      action={mutate}
      iconNode={<FileTextIcon weight="bold" />}
      disabled={!user.is_staff || isPending}
      tooltip={
        !user.is_staff
          ? translate('You must be staff to modify payments')
          : null
      }
    />
  );
};
