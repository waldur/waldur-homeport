import { HeadsetIcon } from '@phosphor-icons/react';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { DialogActionItem } from '@waldur/resource/actions/DialogActionItem';
import { ActionItemType } from '@waldur/resource/actions/types';

const RequestLimitsChangeDialog = lazyComponent(() =>
  import('./RequestLimitsChangeDialog').then((module) => ({
    default: module.RequestLimitsChangeDialog,
  })),
);

export const RequestLimitsChangeAction: ActionItemType = ({ resource }) => (
  <DialogActionItem
    title={translate('Request limits change')}
    modalComponent={RequestLimitsChangeDialog}
    resource={resource}
    iconNode={<HeadsetIcon weight="bold" />}
  />
);
