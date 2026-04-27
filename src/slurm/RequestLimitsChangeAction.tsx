import { HeadsetIcon } from '@phosphor-icons/react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { DialogActionItem } from '@/resource/actions/DialogActionItem';
import { ActionItemType } from '@/resource/actions/types';

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
