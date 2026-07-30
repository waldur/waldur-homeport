import { FC } from 'react';

import { composeValidators, required } from '@/core/validators';
import { NumberGroup, StringGroup } from '@/form';
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

const validateNonNumericQoSName = (value: string) =>
  value && /^\d+$/.test(value)
    ? translate('QoS name cannot consist only of digits.')
    : undefined;

export const OfferingQoSForm: FC = () => {
  return (
    <>
      <StringGroup
        name="name"
        validate={composeValidators(required, validateNonNumericQoSName)}
        label={translate('QOS name')}
        required
      />
      <StringGroup name="description" label={translate('Description')} />
      {/* Limits */}
      <GroupHeader>{translate('Limits')}</GroupHeader>
      <NonNegativeField
        label={translate('Maximum nodes per job')}
        name="max_nodes"
      />
      <NonNegativeField
        label={translate('Minimum nodes per job')}
        name="min_nodes"
      />
      <NonNegativeField
        label={translate('Default time limit in minutes')}
        name="default_time"
      />
      <NonNegativeField
        label={translate('Maximum wall time in minutes')}
        name="max_time"
      />
      <NonNegativeField
        label={translate('Preemption grace time in seconds')}
        name="grace_time"
      />
      <NonNegativeField
        label={translate('Scheduling priority')}
        name="priority"
      />
      {/* TRES limits (SLURM TRES strings, e.g. cpu=256,gres/gpu=8) */}
      <GroupHeader>{translate('TRES limits')}</GroupHeader>
      <StringGroup
        name="grp_tres"
        label={translate('Aggregate TRES (GrpTRES)')}
      />
      <StringGroup
        name="max_tres_per_job"
        label={translate('Max TRES per job (MaxTRESPerJob)')}
      />
      <StringGroup
        name="max_tres_per_node"
        label={translate('Max TRES per node (MaxTRESPerNode)')}
      />
      <StringGroup
        name="max_tres_per_user"
        label={translate('Max TRES per user (MaxTRESPerUser)')}
      />
      <StringGroup
        name="min_tres_per_job"
        label={translate('Min TRES per job (MinTRESPerJob)')}
      />
      <StringGroup
        name="flags"
        label={translate('QOS flags (comma-separated, e.g. DenyOnLimit)')}
      />
    </>
  );
};
