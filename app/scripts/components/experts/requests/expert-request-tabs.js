import template from './expert-request-tabs.html';
import { STATE } from './constants';

const TABS = {
  COMMENTS: 0,
  BIDS: 1,
};

const expertRequestTabs = {
  template,
  bindings: {
    expertRequest: '<',
  },
  controller: class ExpertRequestController {
    $onInit() {
      if (this.expertRequest.state === STATE.PENDING) {
        this.activeTab = TABS.BIDS;
      } else {
        this.activeTab = TABS.COMMENTS;
      }

      this.issue = {
        uuid: this.expertRequest.issue_uuid,
        url: this.expertRequest.issue,
      };
    }
  }
};

export default expertRequestTabs;
