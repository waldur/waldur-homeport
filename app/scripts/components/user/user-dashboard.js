import template from './user-dashboard.html';

const userDashboard = {
  template: template,
  controller: class UserDashboardController {
    // @ngInject
    constructor(usersService) {
      this.usersService = usersService;
    }

    $onInit() {
      this.usersService.getCurrentUser().then(user => {
        this.currentUser = user;
      });
    }
  }
};

export default userDashboard;
