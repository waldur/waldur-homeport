import { useSelector } from 'react-redux';

import { ENV } from '@waldur/configs/default';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { DialogActionItem } from '@waldur/resource/actions/DialogActionItem';
import { ActionItemType } from '@waldur/resource/actions/types';
import { getUser } from '@waldur/workspace/selectors';

const LinkDialog = lazyComponent(() => import('./LinkDialog'), 'LinkDialog');

export const LinkAction: ActionItemType = ({ resource, refetch }) => {
  const user = useSelector(getUser);
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
      />
    );
  }
  return null;
};
