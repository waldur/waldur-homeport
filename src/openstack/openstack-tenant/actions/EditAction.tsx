import { PencilSimpleIcon } from '@phosphor-icons/react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { DialogActionItem } from '@/resource/actions/DialogActionItem';

import { userCanModifyTenant } from './utils';

const EditDialog = lazyComponent(() =>
  import('./EditDialog').then((module) => ({ default: module.EditDialog })),
);

const validators = [userCanModifyTenant];

export const EditAction = ({ resource, refetch }) => (
  <DialogActionItem
    validators={validators}
    title={translate('Edit')}
    modalComponent={EditDialog}
    resource={resource}
    extraResolve={{ refetch }}
    iconNode={<PencilSimpleIcon weight="bold" />}
  />
);
