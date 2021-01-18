import { useSelector } from 'react-redux';

import { ENV } from '@waldur/configs/default';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { DialogActionItem } from '@waldur/resource/actions/DialogActionItem';
import { getUser } from '@waldur/workspace/selectors';

const LinkDialog = lazyComponent(
  () => import(/* webpackChunkName: "LinkDialog" */ './LinkDialog'),
  'LinkDialog',
);

export const LinkAction = ({ resource }) => {
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
      />
    );
  }
  return null;
};
