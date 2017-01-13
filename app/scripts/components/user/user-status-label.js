export default {
  template: '<span>{{::$ctrl.userStatusLabel}}<span>',
  bindings: {
    user: '<',
  },
  controller: class userStatusLabel {
    $onInit() {
      this.userStatusLabel = this.getUserStatusLabel();
    }

    getUserStatusLabel() {
      if (this.user.is_staff && !this.user.is_support) {
        return USER_STATUS_LABELS.staff;
      } else if (this.user.is_staff && this.user.is_support) {
        return USER_STATUS_LABELS.staffAndSupport;
      } else if (!this.user.is_staff && this.user.is_support) {
        return USER_STATUS_LABELS.support;
      }
      return USER_STATUS_LABELS.regularUser;
    }
  },
};

const USER_STATUS_LABELS = {
  support: 'Support user',
  staff: 'Staff',
  regularUser: 'Regular user',
  staffAndSupport: 'Staff and Support user'
};
