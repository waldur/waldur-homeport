import { translate } from '@waldur/i18n';
import {
  createNameField,
  createDescriptionField,
} from '@waldur/resource/actions/base';
import { UpdateResourceDialog } from '@waldur/resource/actions/UpdateResourceDialog';

import { updateAllocation } from './api';

const getFields = () => [
  createNameField(),
  createDescriptionField(),
  {
    name: 'cpu_limit',
    type: 'integer',
    required: true,
    label: translate('CPU limit'),
  },
  {
    name: 'gpu_limit',
    type: 'integer',
    required: true,
    label: translate('GPU limit'),
  },
  {
    name: 'ram_limit',
    type: 'integer',
    required: true,
    label: translate('RAM limit'),
  },
];

export const EditDialog = ({ resolve: { resource } }) => {
  return (
    <UpdateResourceDialog
      fields={getFields()}
      resource={resource}
      initialValues={{
        name: resource.name,
        description: resource.description,
        cpu_limit: resource.cpu_limit,
        gpu_limit: resource.gpu_limit,
        ram_limit: resource.ram_limit,
      }}
      updateResource={updateAllocation}
      verboseName={translate('SLURM allocation')}
    />
  );
};
