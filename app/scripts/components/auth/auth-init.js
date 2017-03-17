import template from './auth-init.html';

export const authInit = {
  template,
  controller: class AuthInitController {
    constructor(usersService, $state, ENV, ncUtilsFlash, coreUtils) {
      // @ngInject
      this.usersService = usersService;
      this.$state = $state;
      this.ncUtilsFlash = ncUtilsFlash;
      this.user = {};
      this.pageTitle = coreUtils.templateFormatter(gettext('Welcome to {pageTitle}!'), {pageTitle: ENV.shortPageTitle});
    }

    $onInit() {
      this.loading = true;
      this.usersService.getCurrentUser().then(user => {
        this.user = angular.copy(user);
      }).finally(() => {
        this.loading = false;
      });
    }

    save({ user }) {
      return this.usersService.update(user).then(response => {
        this.usersService.currentUser = response.data;
        this.$state.go('profile.details');
      }).catch(response => {
        this.ncUtilsFlash.error(gettext('Unable to save user'));
        if (response.status === 400) {
          this.errors = response.data;
        }
      });
    }
  }
};
