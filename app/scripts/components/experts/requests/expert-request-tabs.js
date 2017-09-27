import template from './expert-request-tabs.html';

const expertRequestTabs = {
  template,
  bindings: {
    expertRequest: '<',
  },
  controller: class ExpertRequestController {
    $onInit() {
      this.issue = {
        uuid: this.expertRequest.issue_uuid,
        url: this.expertRequest.issue,
      };
    }
  }
};

export default expertRequestTabs;
