import { useRouter } from '@uirouter/react';
import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';

export const SignupButton: FunctionComponent = () => {
  const router = useRouter();
  return (
    <div className="form-group m-b-sm">
      <p>
        <small>{translate('Do not have an account?')}</small>
      </p>
      <a
        onClick={() => router.stateService.go('register')}
        className="btn btn-default btn-block"
      >
        {translate('Create an account')}
      </a>
    </div>
  );
};
