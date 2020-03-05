import { ENV } from '@waldur/core/services';
import { translate } from '@waldur/i18n';
import { OpenStackInstance } from '@waldur/openstack/openstack-instance/types';
import {
  validateState,
  validateRuntimeState,
} from '@waldur/resource/actions/base';
import {
  ResourceAction,
  ActionField,
  ActionContext,
} from '@waldur/resource/actions/types';
import { formatFlavor } from '@waldur/resource/utils';

function flavorFormatter(flavor) {
  const props = formatFlavor(flavor);
  return `${flavor.name} (${props})`;
}

function formatFlavorChoices(choices, resource) {
  return choices
    .filter(choice => choice.name !== resource.flavor_name)
    .map(flavor => ({
      display_name: flavorFormatter(flavor),
      value: flavor.url,
    }));
}

function createNewFlavorField(
  ctx: ActionContext<OpenStackInstance>,
): ActionField {
  return {
    name: 'flavor',
    type: 'select',
    label: translate('New flavor'),
    init: (field, resource) => {
      field.choices = formatFlavorChoices(field.rawChoices, resource);
    },
    url: `${ENV.apiEndpoint}api/openstacktenant-flavors/?settings_uuid=${ctx.resource.service_settings_uuid}`,
    value_field: 'url',
    display_name_field: 'display_name',
  };
}

function validate(ctx: ActionContext<OpenStackInstance>): string {
  if (ctx.resource.state === 'OK' && ctx.resource.runtime_state === 'ACTIVE') {
    return translate('Please stop the instance before changing its flavor.');
  }
}

export default function createAction(
  ctx: ActionContext<OpenStackInstance>,
): ResourceAction {
  return {
    name: 'change_flavor',
    type: 'form',
    method: 'POST',
    title: translate('Change flavor'),
    validators: [
      validate,
      validateState('OK'),
      validateRuntimeState('SHUTOFF'),
    ],
    fields: [
      {
        name: 'currentFlavor',
        component: 'openstackInstanceCurrentFlavor',
      },
      createNewFlavorField(ctx),
    ],
  };
}
