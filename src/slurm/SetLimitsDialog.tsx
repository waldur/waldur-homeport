import { translate } from '@waldur/i18n';
import { UpdateResourceDialog } from '@waldur/resource/actions/UpdateResourceDialog';

import { setLimits } from './api';

export const SetLimitsDialog = ({ resolve: { resource } }) => (
  <UpdateResourceDialog
    fields={[
      {
        name: 'cpu_limit',
        type: 'integer',
        required: true,
        label: translate('CPU limit (hours)'),
      },
      {
        name: 'gpu_limit',
        type: 'integer',
        required: true,
        label: translate('GPU limit (hours)'),
      },
      {
        name: 'ram_limit',
        type: 'integer',
        required: true,
        label: translate('RAM limit (GB-hours)'),
      },
    ]}
    resource={resource}
    initialValues={resource}
    updateResource={setLimits}
    verboseName={translate('SLURM allocation')}
  />
);
