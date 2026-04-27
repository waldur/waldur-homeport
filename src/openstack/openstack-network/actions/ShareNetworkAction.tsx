import { ShareIcon } from '@phosphor-icons/react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { validateState } from '@/resource/actions/base';
import { DialogActionItem } from '@/resource/actions/DialogActionItem';
import { ActionItemType } from '@/resource/actions/types';

const ShareNetworkDialog = lazyComponent(() =>
  import('./ShareNetworkDialog').then((module) => ({
    default: module.ShareNetworkDialog,
  })),
);

const validators = [validateState('OK')];

export const ShareNetworkAction: ActionItemType = ({ resource, refetch }) => (
  <DialogActionItem
    validators={validators}
    title={translate('Share')}
    modalComponent={ShareNetworkDialog}
    resource={resource}
    extraResolve={{ refetch }}
    iconNode={<ShareIcon weight="bold" />}
    dialogSize="sm"
  />
);
