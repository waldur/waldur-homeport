import { translate } from '@waldur/i18n';
import { updateSnapshotSchedule } from '@waldur/openstack/api';
import { getFields } from '@waldur/openstack/openstack-backup-schedule/actions/fields';
import { UpdateResourceDialog } from '@waldur/resource/actions/UpdateResourceDialog';

export const EditDialog = ({ resolve: { resource } }) => {
  return (
    <UpdateResourceDialog
      fields={getFields()}
      resource={resource}
      initialValues={{
        name: resource.name,
        description: resource.description,
        retention_time: resource.retention_time,
        timezone: resource.timezone,
        maximal_number_of_resources: resource.maximal_number_of_resources,
        schedule: resource.schedule,
      }}
      updateResource={updateSnapshotSchedule}
      verboseName={translate('volume snapshot schedule')}
    />
  );
};
