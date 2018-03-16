import template from './user-manage.html';

class UserManageController {
  // @ngInject
  constructor(usersService,
              $state,
              ncUtilsFlash,
              $uibModal,
              ErrorMessageFormatter,
              $q,
              ISSUE_IDS,
              features,
              ENV) {
    this.usersService = usersService;
    this.$state = $state;
    this.ncUtilsFlash = ncUtilsFlash;
    this.$uibModal = $uibModal;
    this.ISSUE_IDS = ISSUE_IDS;
    this.ErrorMessageFormatter = ErrorMessageFormatter;
    this.$q = $q;
    this.features = features;
    this.ENV = ENV;
  }

  $onInit() {
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
      angular.merge(this.errors, this.ErrorMessageFormatter.parseError(response));
    });
  }

  removeUser() {
    const supportEnabled = this.features.isVisible('support');
    let modalOptions = {};

    if (supportEnabled) {
      modalOptions = {
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
      };
    } else {
      modalOptions = {
        component: 'userRemovalMessageDialog',
        resolve: {
          supportEmail: () => this.ENV.supportEmail,
          userName: () => this.user.full_name,
        },
      };
    }

    this.$uibModal.open(modalOptions);
  }
}

const userManage = {
  restrict: 'E',
  template: template,
  controller: UserManageController
};

export default userManage;
