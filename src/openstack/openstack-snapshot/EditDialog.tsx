import { FC } from 'react';

import { translate } from '@waldur/i18n';
import { updateSnapshot } from '@waldur/openstack/api';
import {
  createNameField,
  createDescriptionField,
} from '@waldur/resource/actions/base';
import { ActionDialogProps } from '@waldur/resource/actions/types';
import { UpdateResourceDialog } from '@waldur/resource/actions/UpdateResourceDialog';

export const EditDialog: FC<ActionDialogProps> = ({
  resolve: { resource, refetch },
}) => (
  <UpdateResourceDialog
    fields={[
      createNameField(),
      createDescriptionField(),
      {
        name: 'kept_until',
        help_text: translate(
          'Guaranteed time of volume snapshot retention. If null - keep forever.',
        ),
        label: translate('Kept until'),
        required: false,
        type: 'datetime',
      },
    ]}
    resource={resource}
    initialValues={{
      name: resource.name,
      description: resource.description,
      kept_until: resource.kept_until,
    }}
    updateResource={updateSnapshot}
    verboseName={translate('volume snapshot')}
    refetch={refetch}
  />
);
