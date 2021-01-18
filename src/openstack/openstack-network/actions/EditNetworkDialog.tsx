import { translate } from '@waldur/i18n';
import { updateNetwork } from '@waldur/openstack/api';
import {
  createNameField,
  createDescriptionField,
} from '@waldur/resource/actions/base';
import { UpdateResourceDialog } from '@waldur/resource/actions/UpdateResourceDialog';

export const EditNetworkDialog = ({ resolve: { resource } }) => {
  return (
    <UpdateResourceDialog
      fields={[createNameField(), createDescriptionField()]}
      resource={resource}
      initialValues={{
        name: resource.name,
        description: resource.description,
      }}
      updateResource={updateNetwork}
      verboseName={translate('network')}
    />
  );
};
