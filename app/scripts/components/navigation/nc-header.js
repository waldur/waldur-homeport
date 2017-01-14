import template from './nc-header.html';

export default {
  template: template,
  controller: class AppHeader {
    constructor($state, usersService, authService) {
      // @ngInject
      this.$state = $state;
      this.usersService = usersService;
      this.authService = authService;
    }

    logout() {
      this.authService.logout();
    }

    gotoSupport() {
      this.usersService.getCurrentUser().then(user => {
        if (user.is_staff) {
          this.$state.go('support.helpdesk');
        } else {
          this.$state.go('support.dashboard');
        }
      });
    }
  }
};
