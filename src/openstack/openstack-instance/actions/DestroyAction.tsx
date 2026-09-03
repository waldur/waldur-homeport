import { FileXIcon } from '@phosphor-icons/react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { validateOpenStackInstanceManagePermission } from '@/openstack/utils';
import { validateState } from '@/resource/actions/base';
import { DialogActionItem } from '@/resource/actions/DialogActionItem';
import { ActionItemType } from '@/resource/actions/types';

const DestroyDialog = lazyComponent(() =>
  import('./DestroyDialog').then((module) => ({
    default: module.DestroyDialog,
  })),
);

const validators = [
  validateState('OK', 'ERRED'),
  validateOpenStackInstanceManagePermission,
];

export const DestroyAction: ActionItemType = ({ resource, refetch }) =>
  resource.marketplace_resource_uuid ? (
    <DialogActionItem
      title={translate('Destroy')}
      validators={validators}
      className="text-danger"
      resource={resource}
      modalComponent={DestroyDialog}
      extraResolve={{ refetch }}
      iconNode={<FileXIcon weight="bold" />}
      iconColor="danger"
    />
  ) : null;
