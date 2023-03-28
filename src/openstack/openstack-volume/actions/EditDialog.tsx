import { translate } from '@waldur/i18n';
import { updateVolume } from '@waldur/openstack/api';
import {
  createLatinNameField,
  createDescriptionField,
} from '@waldur/resource/actions/base';
import { ActionField } from '@waldur/resource/actions/types';
import { UpdateResourceDialog } from '@waldur/resource/actions/UpdateResourceDialog';

export function createBooleanField(): ActionField {
  return {
    name: 'bootable',
    label: translate('Bootable'),
    required: false,
    type: 'boolean',
  };
}

export const EditDialog = ({ resolve: { resource } }) => {
  return (
    <UpdateResourceDialog
      fields={[
        createLatinNameField(),
        createDescriptionField(),
        createBooleanField(),
      ]}
      resource={resource}
      initialValues={{
        name: resource.name,
        description: resource.description,
        bootable: resource.bootable,
      }}
      updateResource={updateVolume}
      verboseName={translate('OpenStack volume')}
    />
  );
};
