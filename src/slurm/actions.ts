import { gettext } from '@waldur/i18n';
import { ActionConfigurationRegistry } from '@waldur/resource/actions/action-configuration';
import { DEFAULT_EDIT_ACTION } from '@waldur/resource/actions/constants';

ActionConfigurationRegistry.register('SLURM.Allocation', {
  order: ['details', 'pull', 'edit', 'cancel', 'destroy'],
  options: {
    pull: {
      title: gettext('Synchronise'),
    },
    details: {
      title: gettext('Details'),
      component: 'slurmAllocationDetailsDialog',
      enabled: true,
      useResolve: true,
      type: 'form',
      dialogSize: 'lg',
    },
    edit: {
      ...DEFAULT_EDIT_ACTION,
      successMessage: gettext('Allocation has been updated.'),
    },
  },
});
