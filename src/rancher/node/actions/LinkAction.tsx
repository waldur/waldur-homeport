import { LinkSimpleIcon } from '@phosphor-icons/react';

import { ENV } from '@/core/config';
import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { DialogActionItem } from '@/resource/actions/DialogActionItem';
import { ActionItemType } from '@/resource/actions/types';
import { useUser } from '@/workspace/hooks';

const LinkDialog = lazyComponent(() =>
  import('./LinkDialog').then((module) => ({ default: module.LinkDialog })),
);

export const LinkAction: ActionItemType = ({ resource, refetch }) => {
  const user = useUser();
  if (
    !resource.instance &&
    user.is_staff &&
    !ENV.plugins.WALDUR_RANCHER.READ_ONLY_MODE
  ) {
    return (
      <DialogActionItem
        title={translate('Link OpenStack Instance')}
        modalComponent={LinkDialog}
        resource={resource}
        extraResolve={{ refetch }}
        staff
        iconNode={<LinkSimpleIcon weight="bold" />}
      />
    );
  }
  return null;
};
