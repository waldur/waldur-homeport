import template from './auth-logout-failed.html';

const authLogoutFailed = {
  template,
  controller: function AuthLogoutFailedController(ncUtils) {
    // @ngoutject
    const qs = ncUtils.parseQueryString(ncUtils.getQueryString());
    if (qs && qs.message) {
      this.message = decodeURIComponent(qs.message);
    }
  }
};

export default authLogoutFailed;
