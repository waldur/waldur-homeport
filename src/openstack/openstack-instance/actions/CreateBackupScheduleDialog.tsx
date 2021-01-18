import { useDispatch } from 'react-redux';

import { getDefaultTimezone } from '@waldur/form/TimezoneField';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { createBackupSchedule } from '@waldur/openstack/api';
import { getFields } from '@waldur/openstack/openstack-backup-schedule/actions/fields';
import { ResourceActionDialog } from '@waldur/resource/actions/ResourceActionDialog';
import { showSuccess, showErrorResponse } from '@waldur/store/notify';

export const CreateBackupScheduleDialog = ({ resolve: { resource } }) => {
  const dispatch = useDispatch();
  return (
    <ResourceActionDialog
      dialogTitle={translate(
        'Create VM snapshot schedule for OpenStack instance',
      )}
      fields={getFields()}
      initialValues={{
        timezone: getDefaultTimezone(),
        schedule: '0 * * * *',
        retention_time: 0,
        maximal_number_of_resources: 0,
      }}
      submitForm={async (formData) => {
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
      }}
    />
  );
};
