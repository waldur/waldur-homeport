import { TrashIcon } from '@phosphor-icons/react';
import { marketplaceOfferingRolesDestroy } from 'waldur-js-client';

import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

export const DeleteRoleDialog = ({
  resolve: { row, refetch },
}: {
  resolve: { row; refetch };
}) => {
  const deleteMutation = useManagedMutation<any, any, void>({
    mutationFn: () =>
      marketplaceOfferingRolesDestroy({ path: { uuid: row.uuid } }),
    successMessage: translate('Role has been removed.'),
    errorMessage: translate('Unable to remove role.'),
    refetch,
  });

  return (
    <ModalDialog
      title={translate('Delete role {name}', { name: row.name })}
      iconNode={<TrashIcon weight="bold" />}
      iconColor="danger"
      footer={
        <>
          <CloseDialogButton className="flex-equal" />
          <SubmitButton
            submitting={deleteMutation.isPending}
            variant="danger"
            className="flex-equal"
            onClick={() => deleteMutation.mutate()}
            type="button"
            label={translate('Delete')}
          />
        </>
      }
    >
      <p>{translate('Are you sure you want to delete this role?')}</p>
    </ModalDialog>
  );
};
