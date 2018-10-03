import template from './user-manage.html';

class UserManageController {
  // @ngInject
  constructor(usersService) {
    this.usersService = usersService;
  }

  $onInit() {
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
