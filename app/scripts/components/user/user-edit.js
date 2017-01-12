import template from './user-edit.html';
import './user-edit.scss';

export default function userEdit() {
  return {
    restrict: 'E',
    template: template,
    scope: {},
    bindToController: {
      user: '=',
      onRemove: '&',
      onSave: '&',
      errors: '=',
      initial: '='
    },
    controller: UserEditController,
    controllerAs: '$ctrl'
  };
}

const USER_STATUS_LABELS = {
  support: 'Support user',
  staff: 'Staff',
  regularUser: 'Regular user',
  staffAndSupport: 'Staff and Support user'
};

// @ngInject
class UserEditController {
  constructor($q, $filter) {
    this.$q = $q;
    this.$filter = $filter;
    this.userStatusLabel = this.getUserStatusLabel();
  }
  save() {
    if (this.UserForm.$invalid) {
      return this.$q.reject();
    }
    return this.onSave();
  }

  getUserStatusLabel() {
    let userStatus = USER_STATUS_LABELS.regularUser;
    if (this.user.is_staff && !this.user.is_support) {
      userStatus = USER_STATUS_LABELS.staff;
    } else if (this.user.is_staff && this.user.is_support) {
      userStatus = USER_STATUS_LABELS.staffAndSupport;
    } else if (!this.user.is_staff && this.user.is_support) {
      userStatus = USER_STATUS_LABELS.support;
    }
    return userStatus;
  }

  getRegistrationMethod() {
    if (!this.user.registration_method) {
      return 'Default';
    } else if (this.user.registration_method === 'openid') {
      return 'Estonian ID';
    } else {
      return this.$filter('titleCase')(this.user.registration_method);
    }
  }
}
