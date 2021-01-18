import { ENV } from '@waldur/configs/default';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { DialogActionItem } from '@waldur/resource/actions/DialogActionItem';

const RequestDirectAccessDialog = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "RequestDirectAccessDialog" */ './RequestDirectAccessDialog'
    ),
  'RequestDirectAccessDialog',
);

export const RequestDirectAccessAction = ({ resource }) =>
  !ENV.plugins.WALDUR_OPENSTACK.TENANT_CREDENTIALS_VISIBLE ? (
    <DialogActionItem
      title={translate('Request direct access')}
      modalComponent={RequestDirectAccessDialog}
      resource={resource}
    />
  ) : null;
