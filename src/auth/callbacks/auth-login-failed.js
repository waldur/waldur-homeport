import { parseQueryString, getQueryString } from '@waldur/core/utils';

import template from './auth-login-failed.html';

function AuthLoginFailedController() {
  const qs = parseQueryString(getQueryString());
  if (qs && qs.message) {
    this.message = decodeURIComponent(qs.message);
  }
}

const authLoginFailed = {
  template,
  controller: AuthLoginFailedController,
};

export default authLoginFailed;
