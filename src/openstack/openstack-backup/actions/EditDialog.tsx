import { FC } from 'react';
import { openstackBackupsUpdate } from 'waldur-js-client';

import { translate } from '@/i18n';
import {
  createNameField,
  createDescriptionField,
} from '@/resource/actions/base';
import { ActionDialogProps } from '@/resource/actions/types';
import { UpdateResourceDialog } from '@/resource/actions/UpdateResourceDialog';

export const EditDialog: FC<ActionDialogProps> = ({
  resolve: { resource, refetch },
}) => {
  return (
    <UpdateResourceDialog
      fields={[
        createNameField(),
        createDescriptionField(),
        {
          name: 'kept_until',
          help_text: translate(
            'Guaranteed time of VM snapshot retention. If null - keep forever.',
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
      updateResource={(uuid, body) =>
        openstackBackupsUpdate({ path: { uuid }, body })
      }
      verboseName={translate('VM snapshot')}
      refetch={refetch}
    />
  );
};
