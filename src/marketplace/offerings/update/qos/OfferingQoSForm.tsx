import { FC } from 'react';

import { composeValidators, required } from '@/core/validators';
import { NumberGroup, StringGroup } from '@/form';
import { translate } from '@/i18n';
import { validateNonNegative } from '@/marketplace/common/utils';

const GroupHeader = ({ children }) => (
  <h4 className="text-secondary mb-3">{children}</h4>
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

// SLURM TRES strings: comma-separated <tres>=<count> pairs, where <tres> is a
// type[/name] or a numeric TRES id; blank means unset. Same pattern as the
// backend's TRESStringValidator.
const TRES_PAIR = String.raw`([A-Za-z][\w/:.@-]*|[1-9]\d*)=\d+[KMGTPkmgtp]?`;
const TRES_PATTERN = new RegExp(`^${TRES_PAIR}(,${TRES_PAIR})*$`);

const validateTRES = (value: string) =>
  value?.trim() && !TRES_PATTERN.test(value.trim())
    ? translate(
        "Enter comma-separated TRES limits such as 'cpu=512,mem=64G,gres/gpu=8'.",
      )
    : undefined;

// Keep '' instead of final-form's default undefined, so clearing a limit is
// sent in the PATCH rather than dropped from it.
const keepBlank = (value: string) => value ?? '';

const TRESField = ({ label, name }) => (
  <StringGroup
    name={name}
    validate={validateTRES}
    parse={keepBlank}
    label={label}
  />
);

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
      <TRESField
        name="grp_tres"
        label={translate('Aggregate TRES (GrpTRES)')}
      />
      <TRESField
        name="max_tres_per_job"
        label={translate('Max TRES per job (MaxTRESPerJob)')}
      />
      <TRESField
        name="max_tres_per_node"
        label={translate('Max TRES per node (MaxTRESPerNode)')}
      />
      <TRESField
        name="max_tres_per_user"
        label={translate('Max TRES per user (MaxTRESPerUser)')}
      />
      <TRESField
        name="min_tres_per_job"
        label={translate('Min TRES per job (MinTRESPerJob)')}
      />
      <TRESField
        name="max_tres_mins_per_job"
        label={translate('Max TRES-minutes per job (MaxTRESMinsPerJob)')}
      />
      <StringGroup
        name="flags"
        label={translate('QOS flags (comma-separated, e.g. DenyOnLimit)')}
      />
    </>
  );
};
