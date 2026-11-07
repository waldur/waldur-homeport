import { PencilSimpleIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { CallTemplate, callTemplatesDestroy } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { formatJsxTemplate, translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';
import { ActionsDropdown } from '@/table/ActionsDropdown';

const CallTemplateFormDialog = lazyComponent(() =>
  import('./CallTemplateFormDialog').then((module) => ({
    default: module.CallTemplateFormDialog,
  })),
);

interface CallTemplateRowActionsProps {
  row: CallTemplate;
  refetch(): void;
}

const DeleteAction: FC<CallTemplateRowActionsProps> = ({ row, refetch }) => {
  const { mutate, isPending } = useManagedMutation({
    mutationFn: () => callTemplatesDestroy({ path: { uuid: row.uuid } }),
    refetch,
    closeModal: false,
    confirmation: {
      title: translate('Confirmation'),
      body: translate(
        'Are you sure you want to delete the call template {name}? Calls created from it are not affected.',
        { name: <strong>{row.name}</strong> },
        formatJsxTemplate,
      ),
      options: { forDeletion: true },
    },
    successMessage: translate('Call template deleted.'),
    errorMessage: translate('Unable to delete the call template.'),
  });
  return (
    <RemovalActionItem
      title={translate('Delete')}
      action={() => mutate()}
      disabled={isPending}
    />
  );
};

export const CallTemplateRowActions: FC<CallTemplateRowActionsProps> = ({
  row,
  refetch,
}) => {
  const { openDialog } = useModal();
  return (
    <ActionsDropdown row={row} refetch={refetch}>
      <ActionItem
        title={translate('Edit')}
        action={() =>
          openDialog(CallTemplateFormDialog, {
            resolve: { template: row, refetch },
            size: 'lg',
          })
        }
        iconNode={<PencilSimpleIcon weight="bold" />}
      />
      <DeleteAction row={row} refetch={refetch} />
    </ActionsDropdown>
  );
};
