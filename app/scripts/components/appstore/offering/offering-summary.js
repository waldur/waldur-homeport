import template from './offering-summary.html';

const offeringSummary = {
  template,
  bindings: {
    offering: '<'
  },
  controller: class {
    $onInit() {
      this.issue = {
        uuid: this.offering.issue_uuid,
        url: this.offering.issue,
      };
    }
  }
};

export default offeringSummary;
