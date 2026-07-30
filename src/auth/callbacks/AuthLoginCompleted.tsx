import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import { FunctionComponent, useEffect } from 'react';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { useRequestToAccessOrganization } from '@/invitations/join-organization/submission';

import { loginUser, exchangeToken } from '../AuthService';

export const AuthLoginCompleted: FunctionComponent = () => {
  const router = useRouter();
  const { params } = useCurrentStateAndParams();
  const { checkAndRequest } = useRequestToAccessOrganization();
  useEffect(() => {
    async function handleLogin() {
      const token = await exchangeToken(params.code);
      await loginUser(token, params.method);
      // When a pending group invitation was submitted, checkAndRequest has
      // already navigated to its destination — don't clobber it.
      const handled = await checkAndRequest();
      if (!handled) {
        router.stateService.go('profile.details');
      }
    }
    handleLogin();
  }, [router, params]);

  return (
    <div className="middle-box text-center">
      <LoadingSpinner />
      <h3>{translate('Logging user in')}</h3>
    </div>
  );
};
