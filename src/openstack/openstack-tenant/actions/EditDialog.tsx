import { FC } from 'react';

import { translate } from '@waldur/i18n';
import { updateTenant } from '@waldur/openstack/api';
import {
  createLatinNameField,
  createDescriptionField,
} from '@waldur/resource/actions/base';
import { ActionDialogProps } from '@waldur/resource/actions/types';
import { UpdateResourceDialog } from '@waldur/resource/actions/UpdateResourceDialog';

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
      updateResource={updateTenant}
      verboseName={translate('OpenStack tenant')}
      refetch={refetch}
    />
  );
};
