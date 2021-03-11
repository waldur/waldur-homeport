import { FunctionComponent } from 'react';

import { ENV } from '@waldur/configs/default';
import { CopyToClipboardContainer } from '@waldur/core/CopyToClipboardContainer';
import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { Field } from '@waldur/resource/summary';

import './SlurmAllocationSummaryExtraDetails.scss';

const formatSubmitDetails = (props) => {
  const value = `sbatch -A ${props.resource.backend_id}`;
  return (
    <CopyToClipboardContainer
      value={value}
      label={
        <>
          {value}
          {props.resource.homepage ? (
            <a
              href={props.resource.homepage}
              target="_blank"
              rel="noopener noreferrer"
              title={translate('Batch processing documentation')}
            >
              &nbsp;
              <i className="fa fa-info-circle" />
            </a>
          ) : null}
        </>
      }
    />
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
    <CopyToClipboardContainer value={value} />
  );
};

export const SlurmAllocationSummaryExtraDetails: FunctionComponent<any> = (
  props,
) => (
  <div className="slurm-allocation-summary-extra-details-container">
    {ENV.plugins.WALDUR_FREEIPA.ENABLED && (
      <div className={props.resource.username ? 'field-container' : ''}>
        <Field
          label={translate('Login with')}
          value={formatLoginDetails(props)}
        />
      </div>
    )}
    <div className="field-container">
      <Field
        label={translate('Submit with')}
        value={formatSubmitDetails(props)}
      />
    </div>
  </div>
);
