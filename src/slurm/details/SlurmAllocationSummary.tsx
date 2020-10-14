import * as React from 'react';

import { formatFilesize, minutesToHours } from '@waldur/core/utils';
import { withTranslation } from '@waldur/i18n';
import {
  Field,
  ResourceSummaryProps,
  PureResourceSummaryBase,
} from '@waldur/resource/summary';
import { SlurmAllocationSummaryExtraDetails } from '@waldur/slurm/details/SlurmAllocationSummaryExtraDetails';

const formatQuota = (translate, usage, limit) =>
  translate('{usage} of {limit}', { usage, limit });

const formatCPU = (props) => {
  const usage = minutesToHours(props.resource.cpu_usage);
  const limit = minutesToHours(props.resource.cpu_limit);
  return formatQuota(props.translate, usage, limit);
};

const formatGPU = (props) => {
  const usage = minutesToHours(props.resource.gpu_usage);
  const limit = minutesToHours(props.resource.gpu_limit);
  return formatQuota(props.translate, usage, limit);
};

const formatRAM = (props) => {
  const usage = formatFilesize(props.resource.ram_usage / 60, 'MB', 'B', '-h');
  const limit = formatFilesize(props.resource.ram_limit, 'MB', 'B', '-h');
  return formatQuota(props.translate, usage, limit);
};

const PureSlurmAllocationSummary = (props: ResourceSummaryProps) => {
  const { translate } = props;
  return (
    <>
      <div className="resource-details-table">
        <PureResourceSummaryBase {...props} />
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
      </div>
      <SlurmAllocationSummaryExtraDetails resource={props.resource} />
    </>
  );
};

export const SlurmAllocationSummary = withTranslation(
  PureSlurmAllocationSummary,
);
