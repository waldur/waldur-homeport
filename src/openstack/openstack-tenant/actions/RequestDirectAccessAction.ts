import { lazyComponent } from '@waldur/core/lazyComponent';
import { ENV } from '@waldur/core/services';
import { translate } from '@waldur/i18n';
import { ResourceAction } from '@waldur/resource/actions/types';

const RequestDirectAccessDialog = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "RequestDirectAccessDialog" */ './RequestDirectAccessDialog'
    ),
  'RequestDirectAccessDialog',
);

export default function createAction(): ResourceAction {
  return {
    name: 'direct_access',
    type: 'form',
    method: 'POST',
    title: translate('Request direct access'),
    component: RequestDirectAccessDialog,
    isVisible: !ENV.plugins.WALDUR_OPENSTACK.TENANT_CREDENTIALS_VISIBLE,
  };
}
