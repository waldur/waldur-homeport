import { translate } from '@waldur/i18n';
import { updateBackupSchedule } from '@waldur/openstack/api';
import { createEditAction, validateState } from '@waldur/resource/actions/base';
import { ResourceAction } from '@waldur/resource/actions/types';

import { getFields } from './fields';

export default function createAction({ resource }): ResourceAction {
  return createEditAction({
    resource,
    fields: getFields(),
    updateResource: updateBackupSchedule,
    getInitialValues: () => ({
      name: resource.name,
      description: resource.description,
      retention_time: resource.retention_time,
      timezone: resource.timezone,
      maximal_number_of_resources: resource.maximal_number_of_resources,
      schedule: resource.schedule,
    }),
    verboseName: translate('VM snapshot schedule'),
    validators: [validateState('OK')],
  });
}
