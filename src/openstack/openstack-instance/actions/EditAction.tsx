import { PencilSimpleIcon } from '@phosphor-icons/react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { validateOpenStackInstanceManagePermission } from '@/openstack/utils';
import { validateState } from '@/resource/actions/base';
import { DialogActionItem } from '@/resource/actions/DialogActionItem';
import { ActionItemType } from '@/resource/actions/types';

const EditDialog = lazyComponent(() =>
  import('./EditDialog').then((module) => ({ default: module.EditDialog })),
);

const validators = [
  validateState('OK'),
  validateOpenStackInstanceManagePermission,
];

export const EditAction: ActionItemType = ({ resource, refetch }) => (
  <DialogActionItem
    validators={validators}
    title={translate('Edit')}
    modalComponent={EditDialog}
    resource={resource}
    extraResolve={{ refetch }}
    iconNode={<PencilSimpleIcon weight="bold" />}
  />
);
