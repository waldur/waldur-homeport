import { FC } from 'react';
import {
  SlurmAllocationSetLimits,
  slurmAllocationsSetLimits,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { ActionDialogProps } from '@/resource/actions/types';
import { UpdateResourceDialog } from '@/resource/actions/UpdateResourceDialog';

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

const parseLimits = (
  limits: SlurmAllocationSetLimits,
): SlurmAllocationSetLimits => ({
  cpu_limit: Math.ceil(limits.cpu_limit / 60),
  gpu_limit: Math.ceil(limits.gpu_limit / 60),
  ram_limit: Math.ceil(limits.ram_limit / 1024 / 60),
});

const serializeLimits = (
  limits: SlurmAllocationSetLimits,
): SlurmAllocationSetLimits => ({
  cpu_limit: limits.cpu_limit * 60,
  gpu_limit: limits.gpu_limit * 60,
  ram_limit: limits.ram_limit * 1024 * 60,
});

export const SetLimitsDialog: FC<ActionDialogProps> = ({
  resolve: { resource, refetch },
}) => (
  <UpdateResourceDialog
    fields={getFields()}
    resource={resource}
    initialValues={parseLimits(resource)}
    updateResource={(id, limits) =>
      slurmAllocationsSetLimits({
        path: { uuid: id },
        body: serializeLimits(limits),
      })
    }
    verboseName={translate('SLURM allocation')}
    refetch={refetch}
  />
);
