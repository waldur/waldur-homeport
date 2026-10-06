import { TrashIcon } from '@phosphor-icons/react';
import { customerCreditsDestroy } from 'waldur-js-client';

import { Menu } from 'waldur-ui';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { useManagedMutation } from '@/modal/useManagedMutation';

const DeleteCreditDialog = lazyComponent(() =>
  import('./DeleteCreditDialog').then((module) => ({
    default: module.DeleteCreditDialog,
  })),
);

export const DeleteCreditButton = ({ row, refetch }) => {
  const { openDialog, closeDialog } = useModal();

  // Deleting an organization credit cascades to the project credits allocated
  // out of it, so the confirmation names them rather than asking about "this
  // credit" alone.
  const deleteMutation = useManagedMutation<any, any, void>({
    mutationFn: () => customerCreditsDestroy({ path: { uuid: row.uuid } }),
    successMessage: translate('Credit deleted successfully.'),
    errorMessage: translate('Error while deleting credit.'),
    refetch,
  });

  const confirm = () =>
    openDialog(DeleteCreditDialog, {
      size: 'lg',
      customerUuid: row.customer_uuid,
      customerName: row.customer_name,
      onConfirm: () => {
        closeDialog();
        deleteMutation.mutate();
      },
    });

  return (
    <Menu.Item
      icon={<TrashIcon weight="bold" />}
      className="text-danger"
      disabled={deleteMutation.isPending}
      onSelect={confirm}
    >
      {translate('Delete')}
    </Menu.Item>
  );
};
