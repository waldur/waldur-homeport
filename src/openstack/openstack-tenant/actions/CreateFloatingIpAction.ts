import { translate } from '@waldur/i18n';
import { OpenStackTenant } from '@waldur/openstack/openstack-tenant/types';
import { validateState } from '@waldur/resource/actions/base';
import { ResourceAction, ActionContext } from '@waldur/resource/actions/types';

function checkExternalNetwork(ctx: ActionContext<OpenStackTenant>): string {
  if (!ctx.resource.external_network_id) {
    return translate(
      'Cannot create floating IP if tenant external network is not defined.',
    );
  }
}

export default function createAction(): ResourceAction {
  return {
    name: 'create_floating_ip',
    type: 'button',
    method: 'POST',
    tab: 'floating_ips',
    title: translate('Create'),
    dialogTitle: translate('Create floating IP for OpenStack tenant'),
    iconClass: 'fa fa-plus',
    validators: [validateState('OK'), checkExternalNetwork],
  };
}
