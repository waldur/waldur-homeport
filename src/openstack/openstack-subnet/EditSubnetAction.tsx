import { PencilSimpleIcon } from '@phosphor-icons/react';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { validateState } from '@waldur/resource/actions/base';
import { DialogActionItem } from '@waldur/resource/actions/DialogActionItem';
import { ActionItemType } from '@waldur/resource/actions/types';

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
