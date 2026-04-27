import { FC } from 'react';
import { marketplaceResourcesPartialUpdate } from 'waldur-js-client';

import { translate } from '@/i18n';
import {
  createNameField,
  createDescriptionField,
} from '@/resource/actions/base';
import { ActionDialogProps } from '@/resource/actions/types';
import { UpdateResourceDialog } from '@/resource/actions/UpdateResourceDialog';

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
    updateResource={(uuid, { name, description }) =>
      marketplaceResourcesPartialUpdate({
        path: { uuid },
        body: { name, description },
      })
    }
    verboseName={translate('resource')}
    refetch={refetch}
  />
);
