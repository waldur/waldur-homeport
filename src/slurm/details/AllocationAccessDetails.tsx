import { FunctionComponent } from 'react';

import { ENV } from '@waldur/configs/default';
import { CopyToClipboardContainer } from '@waldur/core/CopyToClipboardContainer';
import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { SubmitWithField } from '@waldur/slurm/details/SubmitWithField';

const formatLoginDetails = (props) => {
  const value = `ssh ${props.resource.username}@${props.resource.gateway}`;
  return !props.resource.username ? (
    <Link
      state="profile.freeipa"
      label={translate('FreeIPA account needs to be set up.')}
    />
  ) : (
    <>
      <p>{translate('Login with')}</p>{' '}
      <CopyToClipboardContainer value={value} />
    </>
  );
};

export const AllocationAccessDetails: FunctionComponent<any> = (props) => (
  <>
    {ENV.plugins.WALDUR_FREEIPA?.ENABLED && <p>{formatLoginDetails(props)}</p>}
    <SubmitWithField resource={props.resource} />
  </>
);
