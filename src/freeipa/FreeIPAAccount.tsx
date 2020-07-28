import * as React from 'react';
import { useSelector } from 'react-redux';
import useAsyncFn from 'react-use/lib/useAsyncFn';
import useEffectOnce from 'react-use/lib/useEffectOnce';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';
import { getUser } from '@waldur/workspace/selectors';

import { getProfile } from './api';
import { FreeIPAAccountCreate } from './FreeIPAAccountCreate';
import { FreeIPAAccountEdit } from './FreeIPAAccountEdit';

export const FreeIpaAccount = () => {
  useTitle(translate('FreeIPA account'));
  const user = useSelector(getUser);

  const [{ loading, error, value: profile }, refreshProfile] = useAsyncFn(
    () => getProfile(user.uuid),
    [user.uuid],
  );

  useEffectOnce(() => {
    refreshProfile();
  });

  if (loading) return <LoadingSpinner />;

  if (error) return <>{translate('Unable to load data.')}</>;

  return (
    <div className="wrapper wrapper-content">
      {profile ? (
        <FreeIPAAccountEdit profile={profile} refreshProfile={refreshProfile} />
      ) : (
        <FreeIPAAccountCreate onProfileAdded={refreshProfile} />
      )}
    </div>
  );
};
