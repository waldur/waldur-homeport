import template from './offering-summary.html';

const offeringSummary = {
  template,
  bindings: {
    offering: '<'
  },
  controller: class {
    constructor($rootScope, usersService) {
      // @ngInject
      this.$rootScope = $rootScope;
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
      return this.offering.issue_link && (this.currentUser.is_staff || this.currentUser.is_support);
    }

    onCommentCreated() {
      this.$rootScope.$emit('refreshCommentsList');
    }
  }
};

export default offeringSummary;
