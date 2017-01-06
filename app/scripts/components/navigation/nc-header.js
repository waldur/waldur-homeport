import template from './nc-header.html';

export default {
  template: template,
  controller: class AppHeader {
    constructor($state, usersService, $rootScope) {
      // @ngInject
      this.$state = $state;
      this.usersService = usersService;
      this.logout = $rootScope.logout;
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
