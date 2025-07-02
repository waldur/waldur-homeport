import { ShareIcon } from '@phosphor-icons/react';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { validateState } from '@waldur/resource/actions/base';
import { DialogActionItem } from '@waldur/resource/actions/DialogActionItem';
import { ActionItemType } from '@waldur/resource/actions/types';

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
