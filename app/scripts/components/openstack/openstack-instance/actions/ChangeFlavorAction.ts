import { translate } from '@waldur/i18n';
import { OpenStackInstance } from '@waldur/openstack/openstack-instance/types';
import { validateState, validateRuntimeState } from '@waldur/resource/actions/base';
import { ResourceAction, ActionField, ActionContext } from '@waldur/resource/actions/types';
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

function createNewFlavorField(): ActionField {
  return {
    key: 'flavor',
    label: translate('New flavor'),
    init: (field, resource) => {
      field.choices = formatFlavorChoices(field.rawChoices, resource);
    },
  };
}

function validate(ctx: ActionContext<OpenStackInstance>): string {
  if (ctx.resource.state === 'OK' && ctx.resource.runtime_state === 'ACTIVE') {
    return translate('Please stop the instance before changing its flavor.');
  }
}

export default function createAction(_): ResourceAction {
  return {
    key: 'change_flavor',
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
        key: 'currentFlavor',
        component: 'openstackInstanceCurrentFlavor',
      },
      createNewFlavorField(),
    ],
  };
}
