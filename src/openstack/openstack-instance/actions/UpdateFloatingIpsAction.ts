import { translate } from '@waldur/i18n';
import { loadFloatingIps } from '@waldur/openstack/api';
import { OpenStackInstance } from '@waldur/openstack/openstack-instance/types';
import { validateState } from '@waldur/resource/actions/base';
import { ResourceAction } from '@waldur/resource/actions/types';

export default function createAction(): ResourceAction<OpenStackInstance> {
  return {
    name: 'update_floating_ips',
    type: 'form',
    method: 'POST',
    title: translate('Update floating IPs'),
    validators: [validateState('OK')],
    fields: [{
      name: 'floating_ips',
      component: 'openstackInstanceFloatingIps',
    }],
    init: async (resource: OpenStackInstance, form, action) => {
      const floatingIps = await loadFloatingIps(resource.service_settings_uuid);

      action.fields.floating_ips.choices = floatingIps.map(item => ({
        display_name: item.address,
        value: item.url,
      }));

      action.fields.floating_ips.internal_ips_set = resource.internal_ips_set;

      form.floating_ips = resource.floating_ips;
    },
  };
}
