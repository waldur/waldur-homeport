import { PencilSimpleIcon } from '@phosphor-icons/react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { validateState } from '@/resource/actions/base';
import { DialogActionItem } from '@/resource/actions/DialogActionItem';
import { ActionItemType } from '@/resource/actions/types';

const EditSubnetDialog = lazyComponent(() =>
  import('./EditSubnetDialog').then((module) => ({
    default: module.EditSubnetDialog,
  })),
);

const validators = [validateState('OK')];

export const EditSubnetAction: ActionItemType = ({ resource, refetch }) => (
  <DialogActionItem
    validators={validators}
    title={translate('Edit')}
    modalComponent={EditSubnetDialog}
    resource={resource}
    extraResolve={{ refetch }}
    dialogSize="lg"
    iconNode={<PencilSimpleIcon weight="bold" />}
  />
);
