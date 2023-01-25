import { FC } from 'react';

import { translate } from '@waldur/i18n';
import { updateBackupSchedule } from '@waldur/openstack/api';
import { ActionDialogProps } from '@waldur/resource/actions/types';
import { UpdateResourceDialog } from '@waldur/resource/actions/UpdateResourceDialog';

import { getFields } from './fields';

export const EditDialog: FC<ActionDialogProps> = ({
  resolve: { resource, refetch },
}) => {
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
      updateResource={updateBackupSchedule}
      verboseName={translate('VM snapshot schedule')}
      refetch={refetch}
    />
  );
};
