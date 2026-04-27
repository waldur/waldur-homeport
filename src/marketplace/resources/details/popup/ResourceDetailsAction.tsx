import { EyeIcon } from '@phosphor-icons/react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { ResourceAction } from '@/marketplace/resources/actions/constants';
import { DialogActionItem } from '@/resource/actions/DialogActionItem';
import { ActionItemType } from '@/resource/actions/types';

const ResourceDetailsDialog = lazyComponent(() =>
  import('./ResourceDetailsDialog').then((module) => ({
    default: module.ResourceDetailsDialog,
  })),
);

export const ResourceDetailsAction: ActionItemType = ({ resource }) => (
  <DialogActionItem
    title={translate('View details')}
    modalComponent={ResourceDetailsDialog}
    resource={resource}
    iconNode={<EyeIcon weight="bold" />}
    actionId={ResourceAction.VIEW_DETAILS}
  />
);
