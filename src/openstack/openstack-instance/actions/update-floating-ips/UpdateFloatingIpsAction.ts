import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { OpenStackInstance } from '@waldur/openstack/openstack-instance/types';
import { validateState } from '@waldur/resource/actions/base';
import { ResourceAction } from '@waldur/resource/actions/types';

const UpdateFloatingIpsDialog = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "UpdateFloatingIpsDialog" */ './UpdateFloatingIpsDialog'
    ),
  'UpdateFloatingIpsDialog',
);

export default function createAction(): ResourceAction<OpenStackInstance> {
  return {
    name: 'update_floating_ips',
    type: 'form',
    method: 'POST',
    title: translate('Update floating IPs'),
    validators: [validateState('OK')],
    component: UpdateFloatingIpsDialog,
  };
}
