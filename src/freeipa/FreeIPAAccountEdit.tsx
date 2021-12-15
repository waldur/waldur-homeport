import classNames from 'classnames';
import React from 'react';

import { translate } from '@waldur/i18n';

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

export const FreeIPAAccountEdit: React.FC<FreeIPAAccountEditOwnProps> = ({
  profile,
  refreshProfile,
}) => {
  const [loading, setLoading] = React.useState<boolean>();
  return (
    <div className={classNames('row', { disabled: loading })}>
      <div className="form-horizontal">
        <UsernameGroup profile={profile} />
        <div className="form-group">
          <div className="col-sm-offset-3 col-sm-5">
            <SyncProfile
              profile={profile}
              setLoading={setLoading}
              refreshProfile={refreshProfile}
            />
            {profile.is_active
              ? translate('Profile is enabled.')
              : translate('Profile is disabled.')}
          </div>
        </div>
      </div>
    </div>
  );
};
