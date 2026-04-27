import { FC } from 'react';
import { openstackTenantsUpdate } from 'waldur-js-client';

import { translate } from '@/i18n';
import {
  createLatinNameField,
  createDescriptionField,
} from '@/resource/actions/base';
import { ActionDialogProps } from '@/resource/actions/types';
import { UpdateResourceDialog } from '@/resource/actions/UpdateResourceDialog';

export const EditDialog: FC<ActionDialogProps> = ({
  resolve: { resource, refetch },
}) => {
  return (
    <UpdateResourceDialog
      fields={[createLatinNameField(), createDescriptionField()]}
      resource={resource}
      initialValues={{
        name: resource.name,
        description: resource.description,
      }}
      updateResource={(uuid, body) =>
        openstackTenantsUpdate({ path: { uuid }, body })
      }
      verboseName={translate('OpenStack tenant')}
      refetch={refetch}
    />
  );
};
