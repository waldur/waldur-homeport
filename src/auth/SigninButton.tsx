import { useRouter } from '@uirouter/react';
import * as React from 'react';

import { translate } from '@waldur/i18n';

export const SigninButton = () => {
  const router = useRouter();
  return (
    <div className="form-group m-b-sm">
      <p>
        <small>{translate('Already have an account?')}</small>
      </p>
      <a
        onClick={() => router.stateService.go('login')}
        className="btn btn-default btn-block"
      >
        {translate('Login')}
      </a>
    </div>
  );
};
