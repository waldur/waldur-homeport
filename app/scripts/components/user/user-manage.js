import template from './user-manage.html';

class UserManageController {
  // @ngInject
  constructor(usersService, $state, ncUtilsFlash, $uibModal, $q, ISSUE_IDS) {
    this.usersService = usersService;
    this.$state = $state;
    this.ncUtilsFlash = ncUtilsFlash;
    this.$uibModal = $uibModal;
    this.ISSUE_IDS = ISSUE_IDS;
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

  saveUser({ user }) {
    this.errors = {};
    return this.usersService.update(user).then(response => {
      this.usersService.setCurrentUser(response.data);
    }).then(() => {
      this.ncUtilsFlash.success(gettext('Profile has been updated.'));
    }).catch(response => {
      this.ncUtilsFlash.errorFromResponse(response, gettext('Profile could not be updated.'));
      if (response.data && typeof response.data === 'object') {
        let errors = {};
        for (let key in response.data) {
          let errorValue = response.data[key];
          if (Array.isArray(errorValue)) {
            errors[key] = errorValue;
          } else {
            errors[key] = [errorValue];
          }
        }
        Object.assign(this.errors, errors);
      }
    });
  }

  removeUser() {
    return this.$uibModal.open({
      component: 'issueCreateDialog',
      resolve: {
        issue: () => ({
          type: this.ISSUE_IDS.CHANGE_REQUEST,
          summary: 'Account removal'
        }),
        options: {
          title: gettext('Account removal'),
          hideTitle: true,
          descriptionPlaceholder: gettext('Why would you want to go away? Help us become better please!'),
          descriptionLabel: gettext('Reason'),
          submitTitle: gettext('Request removal')
        }
      }
    });
  }
}

const userManage = {
  restrict: 'E',
  template: template,
  controller: UserManageController
};

export default userManage;
