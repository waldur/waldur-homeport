import { translate } from '@waldur/i18n';
import {
  Field,
  ResourceSummaryProps,
  PureResourceSummaryBase,
} from '@waldur/resource/summary';
import { ResourceDetailsTable } from '@waldur/resource/summary/ResourceDetailsTable';
import { SlurmAllocationSummaryExtraDetails } from '@waldur/slurm/details/SlurmAllocationSummaryExtraDetails';

const formatQuota = (usage, limit, units) =>
  translate('{usage} of {limit} {units}', {
    usage,
    limit: limit === -1 ? '∞' : limit,
    units,
  });

export const PureSlurmAllocationSummary = (props: ResourceSummaryProps) => (
  <>
    <ResourceDetailsTable>
      <PureResourceSummaryBase {...props} />
      <Field
        label={translate('CPU')}
        value={formatQuota(
          props.resource.cpu_usage,
          props.resource.cpu_limit,
          'h',
        )}
        helpText={translate('Total CPU hours consumed this month')}
      />
      <Field
        label={translate('GPU')}
        value={formatQuota(
          props.resource.gpu_usage,
          props.resource.gpu_limit,
          'h',
        )}
        helpText={translate('Total GPU hours consumed this month')}
      />
      <Field
        label={translate('RAM')}
        value={formatQuota(
          props.resource.ram_usage,
          props.resource.ram_limit,
          'GB-h',
        )}
        helpText={translate('Total RAM GB-hours consumed this month')}
      />
    </ResourceDetailsTable>
    <SlurmAllocationSummaryExtraDetails resource={props.resource} />
  </>
);
