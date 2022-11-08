import { ENV } from '@waldur/configs/default';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { DialogActionItem } from '@waldur/resource/actions/DialogActionItem';

const RequestDirectAccessDialog = lazyComponent(
  () => import('./RequestDirectAccessDialog'),
  'RequestDirectAccessDialog',
);

export const RequestDirectAccessAction = ({ resource, ...rest }) =>
  !ENV.plugins.WALDUR_OPENSTACK.TENANT_CREDENTIALS_VISIBLE ? (
    <DialogActionItem
      title={translate('Request direct access')}
      modalComponent={RequestDirectAccessDialog}
      resource={resource}
      iconClass="fa-server"
      {...rest}
    />
  ) : null;
