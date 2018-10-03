import template from './auth-init.html';

export const authInit = {
  template,
  controller: class AuthInitController {
    // @ngInject
    constructor(usersService, $state, $rootScope, ENV, ncUtilsFlash, coreUtils) {
      this.usersService = usersService;
      this.$state = $state;
      this.$rootScope = $rootScope;
      this.ncUtilsFlash = ncUtilsFlash;
      this.user = {};
      this.pageTitle = coreUtils.templateFormatter(gettext('Welcome to {pageTitle}!'), {pageTitle: ENV.shortPageTitle});
      this.save = this.save.bind(this);
    }

    $onInit() {
      this.loading = true;
      this.usersService.getCurrentUser().then(user => {
        this.user = angular.copy(user);
      }).finally(() => {
        this.loading = false;
      });
    }

    save(user) {
      return this.usersService.update(user).then(response => {
        this.usersService.currentUser = response.data;
        this.$state.go('profile.details').then(() => {
          this.$rootScope.$broadcast('userInitCompleted');
        });
      }).catch(response => {
        this.ncUtilsFlash.error(gettext('Unable to save user.'));
        if (response.status === 400) {
          this.errors = response.data;
        }
      });
    }
  }
};
