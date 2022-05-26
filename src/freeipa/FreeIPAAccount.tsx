import { useDispatch, useSelector } from 'react-redux';
import { useAsyncFn, useEffectOnce } from 'react-use';

import { ENV } from '@waldur/configs/default';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';
import { router } from '@waldur/router';
import { showError } from '@waldur/store/notify';
import { useUserTabs } from '@waldur/user/constants';
import { getUser } from '@waldur/workspace/selectors';

import { getProfile } from './api';
import { FreeIPAAccountCreate } from './FreeIPAAccountCreate';
import { FreeIPAAccountEdit } from './FreeIPAAccountEdit';

export const FreeIpaAccount = () => {
  useTitle(translate('FreeIPA account'));
  useUserTabs();
  const user = useSelector(getUser);
  const dispatch = useDispatch();

  if (!ENV.plugins.WALDUR_FREEIPA?.ENABLED) {
    dispatch(showError(translate('FreeIPA extension is disabled.')));
    router.stateService.go('errorPage.notFound');
  }

  const [{ loading, error, value: profile }, refreshProfile] = useAsyncFn(
    () => getProfile(user.uuid),
    [user.uuid],
  );

  useEffectOnce(() => {
    refreshProfile();
  });

  if (loading) return <LoadingSpinner />;

  if (error) return <>{translate('Unable to load data.')}</>;

  return profile ? (
    <FreeIPAAccountEdit profile={profile} refreshProfile={refreshProfile} />
  ) : (
    <FreeIPAAccountCreate onProfileAdded={refreshProfile} />
  );
};
