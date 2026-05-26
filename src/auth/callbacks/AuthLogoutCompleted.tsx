import { useEffect, FunctionComponent } from 'react';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';

import * as AuthService from '../AuthService';

export const AuthLogoutCompleted: FunctionComponent = () => {
  useEffect(() => {
    AuthService.explicitLogout();
  }, []);
  return (
    <div className="middle-box text-center">
      <LoadingSpinner />
      <h3>
        {translate(
          'User has been logged out. You will be redirected to the login page soon.',
        )}
      </h3>
    </div>
  );
};
