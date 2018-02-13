import template from './auth-logout-completed.html';

// @ngInject
function AuthLogoutCompletedController(authService) {
  authService.localLogout();
}

export default {
  template,
  controller: AuthLogoutCompletedController
};
