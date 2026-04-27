import { FC } from 'react';
import { openstackVolumesUpdate } from 'waldur-js-client';

import { translate } from '@/i18n';
import {
  createLatinNameField,
  createDescriptionField,
} from '@/resource/actions/base';
import { ActionDialogProps, ActionField } from '@/resource/actions/types';
import { UpdateResourceDialog } from '@/resource/actions/UpdateResourceDialog';

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
      updateResource={(uuid, body) =>
        openstackVolumesUpdate({ path: { uuid }, body })
      }
      refetch={refetch}
      verboseName={translate('OpenStack volume')}
    />
  );
};
