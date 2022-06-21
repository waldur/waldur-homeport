import { minutesToHours } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import {
  Field,
  ResourceSummaryProps,
  ResourceSummaryBase,
} from '@waldur/resource/summary';
import { ResourceDetailsTable } from '@waldur/resource/summary/ResourceDetailsTable';
import { SlurmAllocationSummaryExtraDetails } from '@waldur/slurm/details/SlurmAllocationSummaryExtraDetails';

const formatQuota = (usage, limit) =>
  translate('{usage} of {limit}', { usage, limit });

const formatCPU = (props) => {
  const usage = minutesToHours(props.resource.cpu_usage);
  const limit = minutesToHours(props.resource.cpu_limit);
  return formatQuota(usage, limit);
};

const formatGPU = (props) => {
  const usage = minutesToHours(props.resource.gpu_usage);
  const limit = minutesToHours(props.resource.gpu_limit);
  return formatQuota(usage, limit);
};

const convertRamToGbH = (value: number): string =>
  `${Math.ceil(value / 1024 / 60)} GB-h`;

const formatRAM = (props) => {
  const usage = convertRamToGbH(props.resource.ram_usage);
  const limit = convertRamToGbH(props.resource.ram_limit);
  return formatQuota(usage, limit);
};

export const SlurmAllocationSummary = (props: ResourceSummaryProps) => (
  <>
    <ResourceDetailsTable>
      <ResourceSummaryBase {...props} />
      <Field
        label={translate('CPU')}
        value={formatCPU(props)}
        helpText={translate('Total CPU hours consumed this month')}
      />
      <Field
        label={translate('GPU')}
        value={formatGPU(props)}
        helpText={translate('Total GPU hours consumed this month')}
      />
      <Field
        label={translate('RAM')}
        value={formatRAM(props)}
        helpText={translate('Total RAM GB-hours consumed this month')}
      />
    </ResourceDetailsTable>
    <SlurmAllocationSummaryExtraDetails resource={props.resource} />
  </>
);
