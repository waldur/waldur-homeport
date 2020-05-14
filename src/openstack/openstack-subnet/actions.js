import { ActionConfigurationRegistry } from '@waldur/resource/actions/action-configuration';
import { DEFAULT_EDIT_ACTION } from '@waldur/resource/actions/constants';

ActionConfigurationRegistry.register('OpenStack.SubNet', {
  order: ['edit', 'pull', 'destroy'],
  options: {
    edit: {
      ...DEFAULT_EDIT_ACTION,
      successMessage: gettext('Subnet has been updated.'),
      fields: {
        ...DEFAULT_EDIT_ACTION.fields,
        gateway_ip: {
          type: 'string',
          required: false,
          label: gettext('Gateway IP of this subnet'),
        },
        disable_gateway: {
          type: 'boolean',
          required: false,
          label: gettext('Do not configure a gateway for this subnet'),
        },
      },
    },
    pull: {
      title: gettext('Synchronise'),
    },
  },
});
