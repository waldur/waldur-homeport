import { PlugsConnectedIcon } from '@phosphor-icons/react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { validateRuntimeState } from '@/resource/actions/base';
import { DialogActionItem } from '@/resource/actions/DialogActionItem';
import { ActionItemType } from '@/resource/actions/types';

const AttachDialog = lazyComponent(() =>
  import('./AttachDialog').then((module) => ({ default: module.AttachDialog })),
);

const validators = [validateRuntimeState('available')];

export const AttachAction: ActionItemType = ({ resource, refetch }) => (
  <DialogActionItem
    title={translate('Attach')}
    validators={validators}
    modalComponent={AttachDialog}
    resource={resource}
    extraResolve={{ refetch }}
    important
    iconNode={<PlugsConnectedIcon weight="bold" />}
  />
);
