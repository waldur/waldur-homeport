import { translate } from '@waldur/i18n';
import {
  createNameField,
  createDescriptionField,
} from '@waldur/resource/actions/base';
import { UpdateResourceDialog } from '@waldur/resource/actions/UpdateResourceDialog';

import { updateVirtualMachine } from '../api';

export const EditDialog = ({ resolve: { resource } }) => {
  return (
    <UpdateResourceDialog
      dialogTitle={translate('Update virtual machine')}
      fields={[createNameField(), createDescriptionField()]}
      resource={resource}
      initialValues={{
        name: resource.name,
        description: resource.description,
      }}
      updateResource={updateVirtualMachine}
      verboseName={translate('virtual machine')}
    />
  );
};
