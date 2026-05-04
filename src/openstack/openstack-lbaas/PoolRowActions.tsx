import {
  HeartIcon,
  PencilSimpleIcon,
  TrashIcon,
  UserPlusIcon,
} from '@phosphor-icons/react';
import { FC, useCallback } from 'react';
import {
  OpenStackPool,
  openstackPoolsDestroy,
  openstackPoolsPartialUpdate,
  openstackPoolsPull,
} from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';
import { createNameField } from '@/resource/actions/base';
import { DialogActionItem } from '@/resource/actions/DialogActionItem';
import { PullActionItem } from '@/resource/actions/PullActionItem';
import { ResourceActionDialog } from '@/resource/actions/ResourceActionDialog';
import { ActionDialogProps } from '@/resource/actions/types';
import { useNotify } from '@/store/notify';
import { ActionsDropdownComponent } from '@/table/ActionsDropdown';

const CreateMemberDialogLazy = lazyComponent(() =>
  import('./actions/CreateMemberDialog').then((m) => ({
    default: m.CreateMemberDialog,
  })),
);

const CreateHealthMonitorDialogLazy = lazyComponent(() =>
  import('./actions/CreateHealthMonitorDialog').then((m) => ({
    default: m.CreateHealthMonitorDialog,
  })),
);

const EditPoolDialog: FC<ActionDialogProps<OpenStackPool>> = ({
  resolve: { resource, refetch },
}) => {
  const { closeDialog } = useModal();
  const { showSuccess, showErrorResponse } = useNotify();

  const submitForm = useCallback(
    async (formData) => {
      try {
        await openstackPoolsPartialUpdate({
          path: { uuid: resource.uuid },
          body: { name: formData.name },
        });
        showSuccess(translate('Pool has been updated.'));
        closeDialog();
        if (refetch) await refetch();
      } catch (e) {
        showErrorResponse(e, translate('Unable to update pool.'));
      }
    },
    [closeDialog, refetch, resource, showErrorResponse, showSuccess],
  );

  return (
    <ResourceActionDialog
      dialogTitle={translate('Edit pool')}
      submitForm={submitForm}
      formFields={[createNameField()]}
      initialValues={{ name: resource.name }}
    />
  );
};

const EditPoolDialogLazy = lazyComponent(() =>
  Promise.resolve({ default: EditPoolDialog }),
);

const DestroyPoolButton: FC<{
  resource: OpenStackPool;
  refetch?(): void;
}> = ({ resource, refetch }) => {
  const { confirm } = useModal();
  const { showSuccess, showErrorResponse } = useNotify();

  const destroy = async () => {
    try {
      await confirm(
        translate('Remove pool'),
        translate('Are you sure you want to remove this pool?'),
        { forDeletion: true, positiveButton: translate('Remove') },
      );
    } catch {
      return;
    }
    try {
      await openstackPoolsDestroy({ path: { uuid: resource.uuid } });
      showSuccess(translate('Pool was removed.'));
      if (refetch) refetch();
    } catch (e) {
      showErrorResponse(e, translate('Unable to remove pool.'));
    }
  };

  return (
    <ActionItem
      title={translate('Remove pool')}
      action={destroy}
      iconNode={<TrashIcon weight="bold" />}
      iconColor="danger"
      className="text-danger"
    />
  );
};

interface PoolRowActionsProps {
  row: OpenStackPool;
  fetch(): void;
}

export const PoolRowActions: FC<PoolRowActionsProps> = ({ row, fetch }) => (
  <ActionsDropdownComponent>
    <DialogActionItem
      title={translate('Add member')}
      modalComponent={CreateMemberDialogLazy}
      resource={row}
      extraResolve={{ refetch: fetch }}
      iconNode={<UserPlusIcon weight="bold" />}
    />
    <DialogActionItem
      title={translate('Add health monitor')}
      modalComponent={CreateHealthMonitorDialogLazy}
      resource={row}
      extraResolve={{ refetch: fetch }}
      iconNode={<HeartIcon weight="bold" />}
    />
    <DialogActionItem
      title={translate('Edit')}
      modalComponent={EditPoolDialogLazy}
      resource={row}
      extraResolve={{ refetch: fetch }}
      iconNode={<PencilSimpleIcon weight="bold" />}
    />
    <PullActionItem
      apiMethod={(uuid) => openstackPoolsPull({ path: { uuid } })}
      resource={row}
      refetch={fetch}
    />
    <DestroyPoolButton resource={row} refetch={fetch} />
  </ActionsDropdownComponent>
);
