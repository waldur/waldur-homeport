import * as React from 'react';

import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { Field } from '@waldur/resource/summary';
import { CopyToClipboardButton } from '@waldur/slurm/CopyToClipboardButton';

import './SlurmAllocationSummaryExtraDetails.scss';

const formatSubmitDetails = (props) => {
  const value = `${
    props.resource.batch_service === 'MOAB' ? 'qsub' : 'sbatch'
  } -A ${props.resource.backend_id}`;
  return (
    <div className="pre-container">
      <pre>
        <div className="m-b-sm m-t-sm copyable-content">
          {value}
          {props.resource.homepage && (
            <a
              href={props.resource.homepage}
              target="_blank"
              rel="noopener noreferrer"
              title={translate('Batch processing documentation')}
            >
              &nbsp;
              <i className="fa fa-info-circle" />
            </a>
          )}
        </div>
        <span className="m-l-xs copy-to-clipboard-container">
          <CopyToClipboardButton value={value} />
        </span>
      </pre>
    </div>
  );
};

const formatLoginDetails = (props) => {
  const value = `ssh ${props.resource.username}@${props.resource.gateway}`;
  return !props.resource.username ? (
    <Link
      state="profile.freeipa"
      label={translate('FreeIPA account needs to be set up.')}
    />
  ) : (
    <div className="pre-container">
      <pre>
        <div className="m-b-sm m-t-sm copyable-content">{value}</div>
        <span className="m-l-xs copy-to-clipboard-container">
          <CopyToClipboardButton value={value} />
        </span>
      </pre>
    </div>
  );
};

export const SlurmAllocationSummaryExtraDetails = (props) => (
  <div className="slurm-allocation-summary-extra-details-container">
    <div className={props.resource.username ? 'field-container' : ''}>
      <Field
        label={translate('Login with')}
        value={formatLoginDetails(props)}
      />
    </div>
    <div className="field-container">
      <Field
        label={translate('Submit with')}
        value={formatSubmitDetails(props)}
      />
    </div>
  </div>
);
