import { LinkSimpleIcon } from '@phosphor-icons/react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { validateState } from '@/resource/actions/base';
import { DialogActionItem } from '@/resource/actions/DialogActionItem';
import { ActionItemType } from '@/resource/actions/types';

const AttachFloatingIpDialog = lazyComponent(() =>
  import('./AttachFloatingIpDialog').then((m) => ({
    default: m.AttachFloatingIpDialog,
  })),
);

const validators = [validateState('OK')];

export const AttachFloatingIpAction: ActionItemType = ({
  resource,
  refetch,
}) => (
  <DialogActionItem
    validators={validators}
    title={translate('Attach floating IP')}
    modalComponent={AttachFloatingIpDialog}
    resource={resource}
    extraResolve={{ refetch }}
    iconNode={<LinkSimpleIcon weight="bold" />}
  />
);
