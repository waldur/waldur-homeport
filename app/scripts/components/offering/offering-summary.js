import template from './offering-summary.html';

const offeringSummary = {
  template,
  bindings: {
    offering: '<'
  },
  controller: class {
    constructor($rootScope) {
      // @ngInject
      this.$rootScope = $rootScope;
    }
    $onInit() {
      this.issue = {
        uuid: this.offering.issue_uuid,
        url: this.offering.issue,
      };
    }

    onCommentCreated() {
      this.$rootScope.$emit('refreshCommentsList');
    }
  }
};

export default offeringSummary;
