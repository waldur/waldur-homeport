export default {
  template: '<span>{{::$ctrl.userStatusLabel}}<span>',
  bindings: {
    user: '<',
  },
  controller: class userStatusLabel {
    constructor() {
      this.userStatusLabel = this.getUserStatusLabel();
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
  },
};

const USER_STATUS_LABELS = {
  support: 'Support user',
  staff: 'Staff',
  regularUser: 'Regular user',
  staffAndSupport: 'Staff and Support user'
};
