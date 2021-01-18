import { translate } from '@waldur/i18n';
import { updateVolume } from '@waldur/openstack/api';
import {
  createLatinNameField,
  createDescriptionField,
} from '@waldur/resource/actions/base';
import { UpdateResourceDialog } from '@waldur/resource/actions/UpdateResourceDialog';

export const EditDialog = ({ resolve: { resource } }) => {
  return (
    <UpdateResourceDialog
      fields={[createLatinNameField(), createDescriptionField()]}
      resource={resource}
      initialValues={{
        name: resource.name,
        description: resource.description,
      }}
      updateResource={updateVolume}
      verboseName={translate('OpenStack volume')}
    />
  );
};
