import template from './auth-logout-failed.html';

// @ngInject
function AuthLogoutFailedController(ncUtils) {
  const qs = ncUtils.parseQueryString(ncUtils.getQueryString());
  if (qs && qs.message) {
    this.message = decodeURIComponent(qs.message);
  }
}

const authLogoutFailed = {
  template,
  controller: AuthLogoutFailedController
};

export default authLogoutFailed;
