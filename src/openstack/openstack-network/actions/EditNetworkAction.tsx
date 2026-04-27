import { PencilSimpleIcon } from '@phosphor-icons/react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { validateState } from '@/resource/actions/base';
import { DialogActionItem } from '@/resource/actions/DialogActionItem';
import { ActionItemType } from '@/resource/actions/types';

const EditNetworkDialog = lazyComponent(() =>
  import('./EditNetworkDialog').then((module) => ({
    default: module.EditNetworkDialog,
  })),
);

const validators = [validateState('OK')];

export const EditNetworkAction: ActionItemType = ({ resource, refetch }) => (
  <DialogActionItem
    validators={validators}
    title={translate('Edit')}
    modalComponent={EditNetworkDialog}
    resource={resource}
    extraResolve={{ refetch }}
    iconNode={<PencilSimpleIcon weight="bold" />}
  />
);
