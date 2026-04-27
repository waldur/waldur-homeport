import { PencilSimpleIcon } from '@phosphor-icons/react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { validateState } from '@/resource/actions/base';
import { DialogActionItem } from '@/resource/actions/DialogActionItem';
import { ActionItemType } from '@/resource/actions/types';
import { useUser } from '@/workspace/hooks';

const EditDialog = lazyComponent(() =>
  import('./EditDialog').then((module) => ({ default: module.EditDialog })),
);

const validators = [validateState('OK')];

const CUSTOM_EDIT_ACTION_RESOURCE_TYPES = [
  'OpenStack.Instance',
  'OpenStack.Tenant',
  'OpenStack.Volume',
  'SLURM.Allocation',
  'VMware.VirtualMachine',
];

export const EditAction: ActionItemType = ({ resource, refetch }) => {
  const user = useUser();

  if (CUSTOM_EDIT_ACTION_RESOURCE_TYPES.includes(resource.resource_type)) {
    return null;
  }

  if (
    !hasPermission(user, {
      permission: PermissionEnum.UPDATE_RESOURCE,
      projectId: resource.project_uuid,
      customerId: resource.customer_uuid,
    })
  ) {
    return null;
  }

  return (
    <DialogActionItem
      validators={validators}
      title={translate('Edit')}
      modalComponent={EditDialog}
      resource={resource}
      extraResolve={{ refetch }}
      iconNode={<PencilSimpleIcon weight="bold" />}
    />
  );
};
