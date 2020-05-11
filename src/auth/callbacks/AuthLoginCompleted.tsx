import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import * as React from 'react';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { ngInjector } from '@waldur/core/services';
import { translate } from '@waldur/i18n';

export const AuthLoginCompleted = () => {
  const router = useRouter();
  const { params } = useCurrentStateAndParams();
  React.useEffect(() => {
    ngInjector.get('authService').loginSuccess({
      data: { token: params.token, method: params.method },
    });
    router.stateService.go('profile.details');
  }, [router.stateService, params.token, params.method]);

  return (
    <div className="middle-box text-center">
      <LoadingSpinner />
      <h3>{translate('Logging user in')}</h3>
    </div>
  );
};
