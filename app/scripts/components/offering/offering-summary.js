import template from './offering-summary.html';

const offeringSummary = {
  template,
  bindings: {
    offering: '<',
    offeringConfig: '<',
  },
  controller: class {
    // @ngInject
    constructor(usersService) {
      this.usersService = usersService;
    }

    $onInit() {
      this.issue = {
        uuid: this.offering.issue_uuid,
        url: this.offering.issue,
      };
      this.usersService.getCurrentUser().then(user => this.currentUser = user);
    }

    showLink() {
      return this.offering.issue_link && this.currentUser && (this.currentUser.is_staff || this.currentUser.is_support);
    }
  }
};

export default offeringSummary;
