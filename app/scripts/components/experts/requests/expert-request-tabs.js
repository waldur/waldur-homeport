import template from './expert-request-tabs.html';

const expertRequestTabs = {
  template,
  bindings: {
    expertRequest: '<'
  },
  controller: class ExpertRequestTabsController {
    // @ngInject
    constructor(issueCommentsService, usersService) {
      this.issueCommentsService = issueCommentsService;
      this.usersService = usersService;
    }

    $onInit() {
      this.usersService.getCurrentUser().then(user => {
        this.issueCommentsService.getIssueComments(this.expertRequest.issue_uuid, user).then(comments => {
          this.comments = comments;
        });
      });
    }
  }
};

export default expertRequestTabs;
