import { FC } from 'react';

import { translate } from '@waldur/i18n';
import { updateResource } from '@waldur/marketplace/common/api';
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
    fields={[createNameField(), createDescriptionField()]}
    resource={resource}
    initialValues={{
      name: resource.name,
      description: resource.description,
    }}
    updateResource={updateResource}
    verboseName={translate('resource')}
    refetch={refetch}
  />
);
