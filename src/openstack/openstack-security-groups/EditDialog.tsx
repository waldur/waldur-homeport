import { FC } from 'react';
import {
  openstackSecurityGroupsUpdate,
  OpenStackSecurityGroupUpdateRequest,
} from 'waldur-js-client';

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
      fields={[createNameField(), createDescriptionField()]}
      resource={resource}
      initialValues={{
        name: resource.name,
        description: resource.description,
      }}
      updateResource={(uuid, formData: OpenStackSecurityGroupUpdateRequest) =>
        openstackSecurityGroupsUpdate({
          path: { uuid },
          body: formData,
        })
      }
      refetch={refetch}
      verboseName={translate('security group')}
    />
  );
};
