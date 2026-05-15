import { HeartIcon } from '@phosphor-icons/react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { DialogActionItem } from '@/resource/actions/DialogActionItem';
import { ActionItemType } from '@/resource/actions/types';

const CreateHealthMonitorDialog = lazyComponent(() =>
  import('./CreateHealthMonitorDialog').then((m) => ({
    default: m.CreateHealthMonitorDialog,
  })),
);

export const AddHealthMonitorAction: ActionItemType = ({
  resource,
  refetch,
}) => (
  <DialogActionItem
    title={translate('Add health monitor')}
    modalComponent={CreateHealthMonitorDialog}
    resource={resource}
    extraResolve={{ refetch }}
    iconNode={<HeartIcon weight="bold" />}
  />
);
