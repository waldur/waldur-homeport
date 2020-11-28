import classNames from 'classnames';
import React from 'react';

import { formatDateTime } from '@waldur/core/dateUtils';
import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';

import { DisableProfile } from './DisableProfile';
import { EnableProfile } from './EnableProfile';
import { SyncProfile } from './SyncProfile';

interface FreeIPAAccountEditOwnProps {
  profile: any;
  refreshProfile(): void;
}

const UsernameGroup = ({ profile }) => (
  <div className="form-group m-b-n">
    <label className="control-label col-sm-3">{translate('Username')}:</label>
    <div className="col-sm-6 m-b-sm">
      <p className="form-control-static">{profile.username}</p>
    </div>
  </div>
);

const TosGroup = ({ profile }) => (
  <div className="form-group">
    <div className="col-sm-offset-3 col-sm-5">
      <p className="form-control-static">
        <Link state="tos.freeipa" target="_blank">
          {translate('Terms of Service')}
        </Link>{' '}
        {translate('have been accepted on')}{' '}
        {formatDateTime(profile.agreement_date)}
      </p>
    </div>
  </div>
);

export const FreeIPAAccountEdit: React.FC<FreeIPAAccountEditOwnProps> = ({
  profile,
  refreshProfile,
}) => {
  const [loading, setLoading] = React.useState<boolean>();
  return (
    <div className={classNames('row', { disabled: loading })}>
      <div className="form-horizontal">
        <UsernameGroup profile={profile} />
        <TosGroup profile={profile} />
        <div className="form-group">
          <div className="col-sm-offset-3 col-sm-5">
            <SyncProfile
              profile={profile}
              setLoading={setLoading}
              refreshProfile={refreshProfile}
            />
            <DisableProfile
              profile={profile}
              setLoading={setLoading}
              refreshProfile={refreshProfile}
            />
            <EnableProfile
              profile={profile}
              setLoading={setLoading}
              refreshProfile={refreshProfile}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
