import * as React from 'react';

import { Link } from '@waldur/core/Link';
import { formatFilesize, minutesToHours } from '@waldur/core/utils';
import { withTranslation } from '@waldur/i18n';
import {
  Field,
  ResourceSummaryProps,
  PureResourceSummaryBase,
} from '@waldur/resource/summary';

const formatLoginDetails = props =>
  !props.resource.username ? (
    <Link
      state="profile.freeipa"
      label={props.translate('FreeIPA account needs to be set up.')}
    />
  ) : (
    `${props.resource.username}@${props.resource.gateway}`
  );

const formatSubmitDetails = props => (
  <span className="html-description">
    {props.resource.batch_service === 'MOAB' ? 'qsub' : 'sbatch'} -A{' '}
    {props.resource.backend_id}
    {props.resource.homepage && (
      <a
        href={props.resource.homepage}
        target="_blank"
        rel="noopener noreferrer"
        title={props.translate('Batch processing documentation')}
      >
        &nbsp;
        <i className="fa fa-info-circle" />
      </a>
    )}
  </span>
);

const formatQuota = (translate, usage, limit) =>
  translate('{usage} of {limit}', { usage, limit });

const formatCPU = props => {
  const usage = minutesToHours(props.resource.cpu_usage);
  const limit = minutesToHours(props.resource.cpu_limit);
  return formatQuota(props.translate, usage, limit);
};

const formatGPU = props => {
  const usage = minutesToHours(props.resource.gpu_usage);
  const limit = minutesToHours(props.resource.gpu_limit);
  return formatQuota(props.translate, usage, limit);
};

const formatRAM = props => {
  const usage = formatFilesize(props.resource.ram_usage);
  const limit = formatFilesize(props.resource.ram_limit);
  return formatQuota(props.translate, usage, limit);
};

const PureSlurmAllocationSummary = (props: ResourceSummaryProps) => {
  const { translate } = props;
  return (
    <span>
      <PureResourceSummaryBase {...props} />
      <Field
        label={translate('Login details')}
        value={formatLoginDetails(props)}
      />
      <Field
        label={translate('Submit with')}
        value={formatSubmitDetails(props)}
      />
      <Field label={translate('CPU')} value={formatCPU(props)} />
      <Field label={translate('GPU')} value={formatGPU(props)} />
      <Field label={translate('RAM')} value={formatRAM(props)} />
    </span>
  );
};

export const SlurmAllocationSummary = withTranslation(
  PureSlurmAllocationSummary,
);
