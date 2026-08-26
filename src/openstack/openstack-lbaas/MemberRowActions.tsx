import { PencilSimpleIcon, TrashIcon } from '@phosphor-icons/react';
import { FC, useCallback } from 'react';
import {
  OpenStackPoolMember,
  openstackPoolMembersDestroy,
  openstackPoolMembersPartialUpdate,
  openstackPoolMembersPull,
} from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ScopeSubtitle } from '@/modal/ScopeSubtitle';
import { ActionItem } from '@/resource/actions/ActionItem';
import { createNameField } from '@/resource/actions/base';
import { DialogActionItem } from '@/resource/actions/DialogActionItem';
import { PullActionItem } from '@/resource/actions/PullActionItem';
import { ResourceActionDialog } from '@/resource/actions/ResourceActionDialog';
import { ActionDialogProps } from '@/resource/actions/types';
import { useNotify } from '@/store/notify';
import { ActionsDropdownComponent } from '@/table/ActionsDropdown';

const EditMemberDialog: FC<ActionDialogProps<OpenStackPoolMember>> = ({
  resolve: { resource, refetch },
}) => {
  const { closeDialog } = useModal();
  const { showSuccess, showErrorResponse } = useNotify();

  const submitForm = useCallback(
    async (formData) => {
      try {
        await openstackPoolMembersPartialUpdate({
          path: { uuid: resource.uuid },
          body: {
            name: formData.name,
            weight: formData.weight ? Number(formData.weight) : undefined,
          },
        });
        showSuccess(translate('Member has been updated.'));
        closeDialog();
        if (refetch) await refetch();
      } catch (e) {
        showErrorResponse(e, translate('Unable to update member.'));
      }
    },
    [closeDialog, refetch, resource, showErrorResponse, showSuccess],
  );

  return (
    <ResourceActionDialog
      dialogTitle={translate('Edit member')}
      dialogSubtitle={
        <ScopeSubtitle label={translate('Member name')} name={resource.name} />
      }
      submitForm={submitForm}
      formFields={[
        createNameField(),
        {
          name: 'weight',
          label: translate('Weight'),
          type: 'integer',
          minValue: 0,
          maxValue: 256,
          required: false,
        },
      ]}
      initialValues={{
        name: resource.name,
        weight: (resource as any).weight,
      }}
    />
  );
};

const EditMemberDialogLazy = lazyComponent(() =>
  Promise.resolve({ default: EditMemberDialog }),
);

const DestroyMemberButton: FC<{
  resource: OpenStackPoolMember;
  refetch?(): void;
}> = ({ resource, refetch }) => {
  const { confirm } = useModal();
  const { showSuccess, showErrorResponse } = useNotify();

  const destroy = async () => {
    try {
      await confirm(
        translate('Remove member'),
        translate('Are you sure you want to remove this member?'),
        { forDeletion: true, positiveButton: translate('Remove') },
      );
    } catch {
      return;
    }
    try {
      await openstackPoolMembersDestroy({ path: { uuid: resource.uuid } });
      showSuccess(translate('Member was removed.'));
      if (refetch) refetch();
    } catch (e) {
      showErrorResponse(e, translate('Unable to remove member.'));
    }
  };

  return (
    <ActionItem
      title={translate('Remove member')}
      action={destroy}
      iconNode={<TrashIcon weight="bold" />}
      iconColor="danger"
      className="text-danger"
    />
  );
};

interface MemberRowActionsProps {
  row: OpenStackPoolMember;
  fetch(): void;
}

export const MemberRowActions: FC<MemberRowActionsProps> = ({ row, fetch }) => (
  <ActionsDropdownComponent>
    <DialogActionItem
      title={translate('Edit')}
      modalComponent={EditMemberDialogLazy}
      resource={row}
      extraResolve={{ refetch: fetch }}
      iconNode={<PencilSimpleIcon weight="bold" />}
    />
    <PullActionItem
      apiMethod={(uuid) => openstackPoolMembersPull({ path: { uuid } })}
      resource={row}
      refetch={fetch}
    />
    <DestroyMemberButton resource={row} refetch={fetch} />
  </ActionsDropdownComponent>
);
