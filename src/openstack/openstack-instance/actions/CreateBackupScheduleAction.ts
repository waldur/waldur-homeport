import { $rootScope } from '@waldur/core/services';
import { getDefaultTimezone } from '@waldur/form/TimezoneField';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { getFields } from '@waldur/openstack/openstack-backup-schedule/actions/fields';
import { validateState } from '@waldur/resource/actions/base';
import {
  ResourceActionDialog,
  RESOURCE_ACTION_FORM,
} from '@waldur/resource/actions/ResourceActionDialog';
import { ResourceAction } from '@waldur/resource/actions/types';
import { showErrorResponse, showSuccess } from '@waldur/store/coreSaga';

import { createBackupSchedule } from '../../api';

export default function createAction({ resource }): ResourceAction {
  return {
    name: 'create_backup_schedule',
    title: translate('Create'),
    dialogTitle: translate(
      'Create VM snapshot schedule for OpenStack instance',
    ),
    tab: 'backup_schedules',
    iconClass: 'fa fa-plus',
    type: 'form',
    method: 'POST',
    validators: [validateState('OK')],
    fields: getFields(),
    component: ResourceActionDialog,
    formId: RESOURCE_ACTION_FORM,
    useResolve: true,
    getInitialValues: () => ({
      timezone: getDefaultTimezone(),
      schedule: '0 * * * *',
      retention_time: 0,
      maximal_number_of_resources: 0,
    }),
    submitForm: async (dispatch, formData) => {
      try {
        await createBackupSchedule(resource.uuid, formData);
        dispatch(
          showSuccess(translate('VM snapshot schedule has been created.')),
        );
        dispatch(closeModalDialog());
      } catch (e) {
        dispatch(
          showErrorResponse(
            e,
            translate('Unable to create VM snapshot schedule.'),
          ),
        );
      }
    },
    onSuccess() {
      $rootScope.$broadcast('updateBackupScheduleList');
    },
  };
}
