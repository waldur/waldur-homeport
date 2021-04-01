import { FunctionComponent } from 'react';

import { ENV } from '@waldur/configs/default';
import { CopyToClipboardContainer } from '@waldur/core/CopyToClipboardContainer';
import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { Field } from '@waldur/resource/summary';
import { SubmitWithField } from '@waldur/slurm/details/SubmitWithField';

import './SlurmAllocationSummaryExtraDetails.scss';

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
    {ENV.plugins.WALDUR_FREEIPA?.ENABLED && (
      <div className={props.resource.username ? 'field-container' : ''}>
        <Field
          label={translate('Login with')}
          value={formatLoginDetails(props)}
        />
      </div>
    )}
    <SubmitWithField resource={props.resource} />
  </div>
);
