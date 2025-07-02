import { LinkIcon } from '@phosphor-icons/react';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { DialogActionItem } from '@waldur/resource/actions/DialogActionItem';
import { ActionItemType } from '@waldur/resource/actions/types';
import { useUser } from '@waldur/workspace/hooks';

const SetSlugDialog = lazyComponent(() =>
  import('./SetSlugDialog').then((module) => ({
    default: module.SetSlugDialog,
  })),
);

export const SetSlugAction: ActionItemType = ({ resource, refetch }) => {
  const user = useUser();
  if (!user.is_staff) {
    return null;
  }
  return (
    <DialogActionItem
      title={translate('Set slug')}
      modalComponent={SetSlugDialog}
      extraResolve={{ refetch }}
      resource={resource}
      staff
      iconNode={<LinkIcon weight="bold" />}
    />
  );
};
