import template from './auth-login-failed.html';

// @ngInject
function AuthLoginFailedController(ncUtils) {
  const qs = ncUtils.parseQueryString(ncUtils.getQueryString());
  if (qs && qs.message) {
    this.message = decodeURIComponent(qs.message);
  }
}

const authLoginFailed = {
  template,
  controller: AuthLoginFailedController
};

export default authLoginFailed;
