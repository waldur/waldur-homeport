import { translate } from '@waldur/i18n';
import { updateResource } from '@waldur/marketplace/common/api';
import {
  createNameField,
  createDescriptionField,
} from '@waldur/resource/actions/base';
import { UpdateResourceDialog } from '@waldur/resource/actions/UpdateResourceDialog';

export const EditDialog = ({ resolve: { resource, reInitResource } }) => (
  <UpdateResourceDialog
    fields={[createNameField(), createDescriptionField()]}
    resource={resource}
    initialValues={{
      name: resource.name,
      description: resource.description,
    }}
    updateResource={updateResource}
    verboseName={translate('resource')}
    reInitResource={reInitResource}
  />
);
