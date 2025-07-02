import { EyeIcon } from '@phosphor-icons/react';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { DialogActionItem } from '@waldur/resource/actions/DialogActionItem';
import { ActionItemType } from '@waldur/resource/actions/types';

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
  />
);
