import { PlugsConnectedIcon } from '@phosphor-icons/react';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { validateRuntimeState } from '@waldur/resource/actions/base';
import { DialogActionItem } from '@waldur/resource/actions/DialogActionItem';
import { ActionItemType } from '@waldur/resource/actions/types';

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
