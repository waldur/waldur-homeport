import { ENV } from '@waldur/core/services';
import { translate } from '@waldur/i18n';
import { OpenStackInstance } from '@waldur/openstack/openstack-instance/types';
import { validateState } from '@waldur/resource/actions/base';
import { ResourceAction, ActionField, ActionContext } from '@waldur/resource/actions/types';

function createField(ctx: ActionContext<OpenStackInstance>): ActionField<OpenStackInstance> {
  return {
    name: 'floating_ips',
    resource_default_value: true,
    component: 'openstackInstanceFloatingIps',
    init: (field, resource) => {
      field.internal_ips_set = resource.internal_ips_set;
    },
    url: `${ENV.apiEndpoint}api/openstacktenant-floating-ips/?is_booked=False&free=True&settings_uuid=${ctx.resource.service_settings_uuid}`,
    display_name_field: 'address',
    value_field: 'url',
  };
}

export default function createAction(ctx): ResourceAction<OpenStackInstance> {
  return {
    name: 'update_floating_ips',
    type: 'form',
    method: 'POST',
    title: translate('Update floating IPs'),
    validators: [validateState('OK')],
    fields: [createField(ctx)],
  };
}
