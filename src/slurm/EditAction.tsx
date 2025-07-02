import { PencilSimpleIcon } from '@phosphor-icons/react';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { validateState } from '@waldur/resource/actions/base';
import { DialogActionItem } from '@waldur/resource/actions/DialogActionItem';
import { ActionItemType } from '@waldur/resource/actions/types';

const EditDialog = lazyComponent(() =>
  import('./EditDialog').then((module) => ({ default: module.EditDialog })),
);

const validators = [validateState('OK')];

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
