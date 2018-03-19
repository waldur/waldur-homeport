import template from './user-manage.html';

class UserManageController {
  // @ngInject
  constructor(usersService,
              $state,
              ncUtilsFlash,
              $uibModal,
              ErrorMessageFormatter,
              $q,
              ISSUE_IDS) {
    this.usersService = usersService;
    this.$state = $state;
    this.ncUtilsFlash = ncUtilsFlash;
    this.$uibModal = $uibModal;
    this.ISSUE_IDS = ISSUE_IDS;
    this.ErrorMessageFormatter = ErrorMessageFormatter;
    this.$q = $q;
    this.init();
  }

  init() {
    this.loading = true;
    this.usersService.getCurrentUser().then(user => {
      this.user = user;
    }).finally(() => {
      this.loading = false;
    });
  }
}

const userManage = {
  restrict: 'E',
  template: template,
  controller: UserManageController
};

export default userManage;
