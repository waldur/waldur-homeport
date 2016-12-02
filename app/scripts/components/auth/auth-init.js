import template from './auth-init.html';

export default function authInit() {
  return {
    restrict: 'E',
    controller: AuthInitController,
    controllerAs: 'InitialData',
    template: template,
    scope: {},
    bindToController: true
  };
}

// @ngInject
class AuthInitController {
  constructor(usersService, $state, ENV, ncUtilsFlash) {
    this.usersService = usersService;
    this.$state = $state;
    this.ncUtilsFlash = ncUtilsFlash,
    this.user = {};
    this.pageTitle = ENV.shortPageTitle;
    this.loadUser();
  }

  loadUser() {
    this.loading = true;
    this.usersService.getCurrentUser().then(user => {
      this.user = user;
    }).finally(() => {
      this.loading = false;
    });
  }

  save() {
    return this.user.$update().then(() => {
      this.usersService.currentUser = null;
      this.$state.go('profile.details');
    }).catch(response => {
      this.ncUtilsFlash.error('Unable to save user');
      if (response.status === 400) {
        this.errors = response.data;
      }
    });
  }
}
