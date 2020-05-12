import { gettext } from '@waldur/i18n';
import { ActionConfigurationRegistry } from '@waldur/resource/actions/action-configuration';
import {
  latinName,
  DEFAULT_EDIT_ACTION,
} from '@waldur/resource/actions/constants';

ActionConfigurationRegistry.register('OpenStackTenant.Snapshot', {
  order: ['edit', 'pull', 'restore', 'destroy'],
  options: {
    restore: {
      dialogSubtitle: gettext(
        'Please provide details of a new volume created from snapshot.',
      ),
    },
    edit: {
      ...DEFAULT_EDIT_ACTION,
      successMessage: gettext('Snapshot has been updated.'),
      fields: {
        name: latinName,
        kept_until: {
          help_text: gettext(
            'Guaranteed time of snapshot retention. If null - keep forever.',
          ),
          label: gettext('Kept until'),
          required: false,
          type: 'datetime',
        },
      },
    },
    pull: {
      title: gettext('Synchronise'),
    },
  },
});
