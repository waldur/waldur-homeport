import { translate } from '@waldur/i18n';
import { UpdateResourceDialog } from '@waldur/resource/actions/UpdateResourceDialog';

import { setLimits } from './api';
import { AllocationLimits } from './types';

const getFields = () => [
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
];

const parseLimits = (limits: AllocationLimits): AllocationLimits => ({
  cpu_limit: Math.ceil(limits.cpu_limit / 60),
  gpu_limit: Math.ceil(limits.gpu_limit / 60),
  ram_limit: Math.ceil(limits.ram_limit / 1024 / 60),
});

const serializeLimits = (limits: AllocationLimits): AllocationLimits => ({
  cpu_limit: limits.cpu_limit * 60,
  gpu_limit: limits.gpu_limit * 60,
  ram_limit: limits.ram_limit * 1024 * 60,
});

export const SetLimitsDialog = ({ resolve: { resource } }) => {
  return (
    <UpdateResourceDialog
      fields={getFields()}
      resource={resource}
      initialValues={parseLimits(resource)}
      updateResource={(id, limits) => setLimits(id, serializeLimits(limits))}
      verboseName={translate('SLURM allocation')}
    />
  );
};
