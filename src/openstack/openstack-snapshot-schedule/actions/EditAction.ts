import { translate } from '@waldur/i18n';
import { updateSnapshotSchedule } from '@waldur/openstack/api';
import { getFields } from '@waldur/openstack/openstack-backup-schedule/actions/fields';
import { createEditAction, validateState } from '@waldur/resource/actions/base';
import { ResourceAction } from '@waldur/resource/actions/types';

export default function createAction({ resource }): ResourceAction {
  return createEditAction({
    resource,
    fields: getFields(),
    updateResource: updateSnapshotSchedule,
    getInitialValues: () => ({
      name: resource.name,
      description: resource.description,
      retention_time: resource.retention_time,
      timezone: resource.timezone,
      maximal_number_of_resources: resource.maximal_number_of_resources,
      schedule: resource.schedule,
    }),
    verboseName: translate('volume snapshot schedule'),
    validators: [validateState('OK')],
  });
}
