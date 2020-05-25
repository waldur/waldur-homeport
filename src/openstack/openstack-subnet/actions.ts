import { gettext } from '@waldur/i18n';
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
          label: gettext('Disable gateway IP advertising via DHCP'),
        },
        enable_default_gateway: {
          type: 'boolean',
          required: false,
          resource_default_value: true,
          label: gettext('Connect subnet to a default virtual router'),
        },
      },
    },
    pull: {
      title: gettext('Synchronise'),
    },
  },
});
