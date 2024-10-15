import { useRouter } from '@uirouter/react';
import { useEffect, FunctionComponent } from 'react';

import { ENV } from '@waldur/configs/default';
import { post } from '@waldur/core/api';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';

import { AuthService } from './AuthService';

export const LogoutPage: FunctionComponent = () => {
  const router = useRouter();
  useEffect(() => {
    post(ENV.apiEndpoint + 'api-auth/logout/').then(() => {
      AuthService.clearAuthCache(true);
      router.stateService.go('login');
    });
  }, []);
  return (
    <div className="middle-box text-center">
      <LoadingSpinner />
      <h3>{translate('User are being logged out.')}</h3>
    </div>
  );
};
