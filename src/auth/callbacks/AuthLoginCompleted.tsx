import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import * as React from 'react';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { UsersService } from '@waldur/user/UsersService';

import { AuthService } from '../AuthService';

export const AuthLoginCompleted = () => {
  const router = useRouter();
  const { params } = useCurrentStateAndParams();
  const completeAuth = React.useCallback(
    async (token, method) => {
      AuthService.setAuthHeader(token);
      const user = await UsersService.getCurrentUser();
      AuthService.loginSuccess({
        data: { ...user, method },
      });
      router.stateService.go('profile.details');
    },
    [router.stateService],
  );
  React.useEffect(() => {
    completeAuth(params.token, params.method);
  }, [completeAuth, params]);

  return (
    <div className="middle-box text-center">
      <LoadingSpinner />
      <h3>{translate('Logging user in')}</h3>
    </div>
  );
};
