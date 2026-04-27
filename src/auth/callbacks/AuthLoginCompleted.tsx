import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import { FunctionComponent, useEffect } from 'react';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { tryJoinOrganization } from '@/invitations/tryJoinOrganization';

import { loginUser } from '../AuthService';

export const AuthLoginCompleted: FunctionComponent = () => {
  const router = useRouter();
  const { params } = useCurrentStateAndParams();
  useEffect(() => {
    loginUser(params.token, params.method).then(() => {
      tryJoinOrganization();
      router.stateService.go('profile.details');
    });
  }, [router, params]);

  return (
    <div className="middle-box text-center">
      <LoadingSpinner />
      <h3>{translate('Logging user in')}</h3>
    </div>
  );
};
