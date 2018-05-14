import { ENV } from '@waldur/core/services';
import { translate } from '@waldur/i18n';
import { OpenStackInstance } from '@waldur/openstack/openstack-instance/types';
import { validateState } from '@waldur/resource/actions/base';
import { ResourceAction, ActionContext } from '@waldur/resource/actions/types';

function createField(ctx) {
  return {
    name: 'security_groups',
    type: 'multiselect',
    required: true,
    label: translate('Security groups'),
    placeholder: translate('Select security groups...'),
    resource_default_value: true,
    serializer: items => items.map(item => ({url: item.value})),
    url: `${ENV.apiEndpoint}api/openstacktenant-security-groups/?settings_uuid=${ctx.resource.service_settings_uuid}`,
    value_field: 'url',
    display_name_field: 'name',
  };
}

export default function createAction(ctx: ActionContext<OpenStackInstance>): ResourceAction {
  return {
    name: 'update_security_groups',
    title: translate('Update security groups'),
    type: 'form',
    method: 'POST',
    validators: [validateState('OK')],
    fields: [createField(ctx)],
  };
}
