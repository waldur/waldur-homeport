import { getDefaultTimezone } from '@waldur/form/TimezoneField';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { createSnapshotSchedule } from '@waldur/openstack/api';
import { getFields } from '@waldur/openstack/openstack-backup-schedule/actions/fields';
import { validateState } from '@waldur/resource/actions/base';
import { ResourceActionDialog } from '@waldur/resource/actions/ResourceActionDialog';
import { ResourceAction } from '@waldur/resource/actions/types';
import { showErrorResponse, showSuccess } from '@waldur/store/coreSaga';

export default function createAction({ resource }): ResourceAction {
  return {
    name: 'create_snapshot_schedule',
    title: translate('Create'),
    dialogTitle: translate('Create snapshot schedule for OpenStack volume'),
    tab: 'snapshot_schedules',
    iconClass: 'fa fa-plus',
    type: 'form',
    method: 'POST',
    validators: [validateState('OK')],
    fields: getFields(),
    component: ResourceActionDialog,
    useResolve: true,
    getInitialValues: () => ({
      timezone: getDefaultTimezone(),
      schedule: '0 * * * *',
      retention_time: 0,
      maximal_number_of_resources: 0,
    }),
    submitForm: async (dispatch, formData) => {
      try {
        await createSnapshotSchedule(resource.uuid, formData);
        dispatch(
          showSuccess(
            translate('Snapshot schedule for volume has been created.'),
          ),
        );
        dispatch(closeModalDialog());
      } catch (e) {
        dispatch(
          showErrorResponse(
            e,
            translate('Unable to create snapshot schedule.'),
          ),
        );
      }
    },
  };
}
