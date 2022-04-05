import Qs from 'qs';
import { FunctionComponent } from 'react';

import { Link } from '@waldur/core/Link';
import { getQueryString } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';

export const AuthLoginFailed: FunctionComponent = () => {
  const qs = Qs.parse(getQueryString());
  const message = qs?.message;

  return (
    <div className="middle-box text-center">
      <h3 className="app-title centered">{translate('Login failed')}</h3>
      {message && <p className="mt-3">{message}</p>}
      <p className="mt-3">
        <Link state="login"> &lt; {translate('Back to login')} </Link>
      </p>
    </div>
  );
};
