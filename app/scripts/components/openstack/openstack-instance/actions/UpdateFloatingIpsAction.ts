import { translate } from '@waldur/i18n';
import { OpenStackInstance } from '@waldur/openstack/openstack-instance/types';
import { validateState } from '@waldur/resource/actions/base';
import { ResourceAction, ActionField } from '@waldur/resource/actions/types';

function createField(): ActionField<OpenStackInstance> {
  return {
    key: 'floating_ips',
    resource_default_value: true,
    component: 'openstackInstanceFloatingIps',
    init: (field, resource) => {
      field.internal_ips_set = resource.internal_ips_set;
    },
    display_name_field: 'address',
    value_field: 'url',
  };
}

export default function createAction(_): ResourceAction<OpenStackInstance> {
  return {
    key: 'update_floating_ips',
    type: 'form',
    method: 'POST',
    title: translate('Update floating IPs'),
    validators: [validateState('OK')],
    fields: [createField()],
  };
}
