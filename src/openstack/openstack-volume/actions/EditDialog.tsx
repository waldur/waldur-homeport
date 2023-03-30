import { FC } from 'react';

import { translate } from '@waldur/i18n';
import { updateVolume } from '@waldur/openstack/api';
import {
  createLatinNameField,
  createDescriptionField,
} from '@waldur/resource/actions/base';
import { ActionDialogProps, ActionField } from '@waldur/resource/actions/types';
import { UpdateResourceDialog } from '@waldur/resource/actions/UpdateResourceDialog';

function createBootableField(): ActionField {
  return {
    name: 'bootable',
    label: translate('Bootable'),
    required: false,
    type: 'boolean',
  };
}

export const EditDialog: FC<ActionDialogProps> = ({
  resolve: { resource, refetch },
}) => {
  return (
    <UpdateResourceDialog
      fields={[
        createLatinNameField(),
        createDescriptionField(),
        createBootableField(),
      ]}
      resource={resource}
      initialValues={{
        name: resource.name,
        description: resource.description,
        bootable: resource.bootable,
      }}
      updateResource={updateVolume}
      refetch={refetch}
      verboseName={translate('OpenStack volume')}
    />
  );
};
