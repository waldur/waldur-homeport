import { FC } from 'react';

import { required } from '@/core/validators';
import { NumberGroup, StringGroup, BooleanGroup } from '@/form';
import { translate } from '@/i18n';
import { validateNonNegative } from '@/marketplace/common/utils';

const GroupHeader = ({ children }) => (
  <h4 className="text-gray-700 mb-4">{children}</h4>
);

const NonNegativeField = ({ label, name }) => (
  <NumberGroup
    name={name}
    min={0}
    validate={validateNonNegative}
    label={label}
  />
);

export const OfferingPartitionForm: FC = () => {
  return (
    <>
      <StringGroup
        name="partition_name"
        validate={required}
        label={translate('Partition name')}
        required
      />
      {/* Architecture */}
      <GroupHeader>{translate('Architecture')}</GroupHeader>
      <StringGroup
        name="cpu_arch"
        label={translate('CPU architecture (e.g., x86_64/amd/zen3)')}
      />
      <StringGroup
        name="gpu_arch"
        label={translate('GPU architecture (e.g., nvidia/cc90)')}
      />
      {/* CPU Configuration */}
      <GroupHeader>{translate('CPU configuration')}</GroupHeader>
      <NonNegativeField
        label={translate('Default task binding policy (SLURM cpu_bind)')}
        name="cpu_bind"
      />
      <NonNegativeField
        label={translate('Default CPUs allocated per GPU')}
        name="def_cpu_per_gpu"
      />
      <NonNegativeField
        label={translate('Maximum allocated CPUs per node')}
        name="max_cpus_per_node"
      />
      <NonNegativeField
        label={translate('Maximum allocated CPUs per socket')}
        name="max_cpus_per_socket"
      />
      {/* Memory configuration */}
      <GroupHeader>{translate('Memory configuration (in MB)')}</GroupHeader>
      <NonNegativeField
        label={translate('Default memory per CPU')}
        name="def_mem_per_cpu"
      />
      <NonNegativeField
        label={translate('Default memory per GPU')}
        name="def_mem_per_gpu"
      />
      <NonNegativeField
        label={translate('Default memory per node')}
        name="def_mem_per_node"
      />
      <NonNegativeField
        label={translate('Maximum memory per CPU')}
        name="max_mem_per_cpu"
      />
      <NonNegativeField
        label={translate('Maximum memory per node')}
        name="max_mem_per_node"
      />
      {/* Time limits */}
      <GroupHeader>{translate('Time limits')}</GroupHeader>
      <NonNegativeField
        label={translate('Default time limit in minutes')}
        name="default_time"
      />
      <NonNegativeField
        label={translate('Maximum time limit in minutes')}
        name="max_time"
      />
      <NonNegativeField
        label={translate('Preemption grace time in seconds')}
        name="grace_time"
      />
      {/* Node Configuration */}
      <GroupHeader>{translate('Node configuration')}</GroupHeader>
      <NonNegativeField
        label={translate('Maximum nodes per job')}
        name="max_nodes"
      />
      <NonNegativeField
        label={translate('Minimum nodes per job')}
        name="min_nodes"
      />
      <BooleanGroup
        label={translate('Exclusive topology access required')}
        name="exclusive_topo"
        alignMiddle
      />
      <BooleanGroup
        label={translate('Exclusive user access required')}
        name="exclusive_user"
        alignMiddle
      />
      {/* Scheduling Configuration */}
      <GroupHeader>{translate('Scheduling configuration')}</GroupHeader>
      <NonNegativeField
        label={translate('Priority tier for scheduling and preemption')}
        name="priority_tier"
      />
      <BooleanGroup
        label={translate('Require reservation for job allocation')}
        name="req_resv"
        alignMiddle
      />
    </>
  );
};
