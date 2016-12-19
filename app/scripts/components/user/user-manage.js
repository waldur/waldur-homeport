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
  constructor(usersService, $state, ncUtilsFlash, $uibModal, $q) {
    this.usersService = usersService;
    this.$state = $state;
    this.ncUtilsFlash = ncUtilsFlash;
    this.$uibModal = $uibModal;
    this.$q = $q;
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
    return this.usersService.getCurrentUser().then(user => {
      return this.$uibModal.open({
        component: 'issueCreateDialog',
        resolve: {
          issue: () => ({user: user}),
          options: {
            type: 'remove_user',
            issueSummary: 'Account removal',
            title: 'Account removal',
            descriptionPlaceholder: 'Why would you want to go away? Help us become better please!',
            descriptionLabel: 'Reason',
            submitTitle: 'Request removal',
            issueType: 'Change request'
          }
        }
      });
    });
  }
}
