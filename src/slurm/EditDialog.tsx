// import { formatFilesize, minutesToHours } from '@waldur/core/utils';
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
  /* {
    name: 'cpu_limit',
    type: 'integer',
    required: true,
    label: translate('CPU limit (h)'),
  },
  {
    name: 'gpu_limit',
    type: 'integer',
    required: true,
    label: translate('GPU limit (h)'),
  },
  {
    name: 'ram_limit',
    type: 'integer',
    required: true,
    label: translate('RAM limit (GB-h)'),
  },*/
];

export const EditDialog = ({ resolve: { resource } }) => {
  return (
    <UpdateResourceDialog
      fields={getFields()}
      resource={resource}
      initialValues={{
        name: resource.name,
        description: resource.description,
        /*  cpu_limit: minutesToHours(resource.cpu_limit, false),
        gpu_limit: minutesToHours(resource.gpu_limit, false),
        ram_limit: formatFilesize(resource.ram_limit, 'MB', 'GB', '', false),*/
      }}
      updateResource={updateAllocation}
      verboseName={translate('SLURM allocation')}
    />
  );
};
