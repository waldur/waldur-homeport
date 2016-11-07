import template from './user-manage.html';

export default function userManage() {
  return {
    restrict: 'E',
    template: template,
    controller: UserManageController,
    controllerAs: '$ctrl',
    scope: {},
    bindToController: true
  };
}

// @ngInject
class UserManageController {
  constructor(usersService, $state, ncUtilsFlash) {
    this.usersService = usersService;
    this.$state = $state;
    this.ncUtilsFlash = ncUtilsFlash;
    this.init();
  }

  init() {
    this.loading = true;
    this.usersService.getCurrentUser().then(response => {
      this.user = response;
    }).finally(() => {
      this.loading = false;
    });
  }

  saveUser() {
    return this.user.$update(() => {
      this.usersService.currentUser = null;
    }).then(() => {
      this.ncUtilsFlash.success('Profile has been updated');
    }).catch(response => {
      this.errors = response.data;
    });
  }

  removeUser() {
    return this.$state.go('support.create', {type: 'remove_user'});
  }
}
