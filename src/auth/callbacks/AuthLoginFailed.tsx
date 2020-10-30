import * as React from 'react';

import { Link } from '@waldur/core/Link';
import { parseQueryString, getQueryString } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';

export const AuthLoginFailed = () => {
  const qs = parseQueryString(getQueryString());
  const message = qs && qs.message ? decodeURIComponent(qs.message) : undefined;

  return (
    <div className="middle-box text-center">
      <h3 className="app-title centered">{translate('Login failed')}</h3>
      {message && <p className="m-t-md">{message}</p>}
      <p className="m-t-md">
        <Link state="login"> &lt; {translate('Back to login')} </Link>
      </p>
    </div>
  );
};
