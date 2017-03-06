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
    return this.usersService.update(user).then(response => {
      this.usersService.setCurrentUser(response.data);
    }).then(() => {
      this.ncUtilsFlash.success('Profile has been updated');
    }).catch(response => {
      this.errors = response.data;
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
