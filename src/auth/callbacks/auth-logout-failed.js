import { getQueryString, parseQueryString } from '@waldur/core/utils';

import template from './auth-logout-failed.html';

// @ngInject
function AuthLogoutFailedController() {
  const qs = parseQueryString(getQueryString());
  if (qs && qs.message) {
    this.message = decodeURIComponent(qs.message);
  }
}

const authLogoutFailed = {
  template,
  controller: AuthLogoutFailedController,
};

export default authLogoutFailed;
