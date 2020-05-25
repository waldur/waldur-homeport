import { translate } from '@waldur/i18n';
import { OpenStackInstance } from '@waldur/openstack/openstack-instance/types';
import { ResourceAction, ActionContext } from '@waldur/resource/actions/types';

function validate(ctx: ActionContext<OpenStackInstance>): string {
  if (ctx.resource.state === 'Erred') {
    return;
  }
  if (ctx.resource.state === 'OK') {
    return;
  }
  return translate('Instance should be OK, or erred. Please contact support.');
}

export default function createAction(): ResourceAction<OpenStackInstance> {
  return {
    name: 'force_destroy',
    type: 'form',
    method: 'DELETE',
    destructive: true,
    title: translate('Force destroy'),
    validators: [validate],
    fields: [
      {
        name: 'delete_volumes',
        label: translate('Delete volumes'),
        type: 'boolean',
        default_value: true,
      },
      {
        name: 'release_floating_ips',
        label: translate('Release floating IPs'),
        type: 'boolean',
        default_value: true,
      },
    ],
  };
}
