import { FC } from 'react';
import { openstackNetworksUpdate } from 'waldur-js-client';

import { translate } from '@/i18n';
import {
  createNameField,
  createDescriptionField,
} from '@/resource/actions/base';
import { ActionDialogProps } from '@/resource/actions/types';
import { UpdateResourceDialog } from '@/resource/actions/UpdateResourceDialog';

export const EditNetworkDialog: FC<ActionDialogProps> = ({
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
      updateResource={(uuid, body) =>
        openstackNetworksUpdate({ path: { uuid }, body })
      }
      verboseName={translate('network')}
      refetch={refetch}
    />
  );
};
