import template from './auth-logout-completed.html';

// @ngInject
function AuthLogoutCompletedController(authService) {
  authService.logout();
}

export default {
  template,
  controller: AuthLogoutCompletedController
};
