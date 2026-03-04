import { FC } from 'react';
import { Field } from 'react-final-form';

import { required } from '@waldur/core/validators';
import { NumberField, StringField } from '@waldur/form';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { translate } from '@waldur/i18n';
import { validateNonNegative } from '@waldur/marketplace/common/utils';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';

const GroupHeader = ({ children }) => (
  <h4 className="text-gray-700 mb-4">{children}</h4>
);

const NonNegativeField = ({ label, name }) => (
  <FormGroup label={label}>
    <Field
      name={name}
      component={NumberField as any}
      min={0}
      validate={validateNonNegative}
    />
  </FormGroup>
);

export const OfferingPartitionForm: FC = () => {
  return (
    <>
      <FormGroup label={translate('Partition name')} required>
        <Field
          name="partition_name"
          component={StringField as any}
          validate={required}
        />
      </FormGroup>

      {/* Architecture */}
      <GroupHeader>{translate('Architecture')}</GroupHeader>
      <FormGroup label={translate('CPU architecture (e.g., x86_64/amd/zen3)')}>
        <Field name="cpu_arch" component={StringField as any} />
      </FormGroup>
      <FormGroup label={translate('GPU architecture (e.g., nvidia/cc90)')}>
        <Field name="gpu_arch" component={StringField as any} />
      </FormGroup>

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
      <FormGroup>
        <Field
          label={translate('Exclusive topology access required')}
          name="exclusive_topo"
          component={AwesomeCheckboxField as any}
          alignMiddle
        />
      </FormGroup>
      <FormGroup>
        <Field
          label={translate('Exclusive user access required')}
          name="exclusive_user"
          component={AwesomeCheckboxField as any}
          alignMiddle
        />
      </FormGroup>

      {/* Scheduling Configuration */}
      <GroupHeader>{translate('Scheduling configuration')}</GroupHeader>
      <NonNegativeField
        label={translate('Priority tier for scheduling and preemption')}
        name="priority_tier"
      />
      <FormGroup label={translate('Quality of service (QOS) name')}>
        <Field name="qos" component={StringField as any} />
      </FormGroup>
      <FormGroup>
        <Field
          label={translate('Require reservation for job allocation')}
          name="req_resv"
          component={AwesomeCheckboxField as any}
          alignMiddle
        />
      </FormGroup>
    </>
  );
};
