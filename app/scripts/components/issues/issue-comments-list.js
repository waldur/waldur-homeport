import template from './issue-comments-list.html';

export const issueCommentsList = {
  template,
  bindings: {
    issue: '<'
  },
  controller: class IssueCommentsListController {
    constructor(issueCommentsService, usersService, $rootScope) {
      this.issueCommentsService = issueCommentsService;
      this.usersService = usersService;
      this.$rootScope = $rootScope;
    }

    $onInit() {
      this.unlisten = this.$rootScope.$on('refreshCommentsList', () => {
        this.issueCommentsService.clearAllCacheForCurrentEndpoint();
        this.refresh();
      });
      this.refresh();
    }

    $onDestroy() {
      this.unlisten();
    }

    refresh() {
      this.loading = true;
      this.loadComments().then(comments => {
        this.comments = comments;
      }).catch(() => {
        this.erred = true;
      }).finally(() => {
        this.loading = false;
      });
    }

    loadComments() {
      return this.usersService.getCurrentUser().then(user => {
        return this.issueCommentsService.getIssueComments(this.issue.uuid, user);
      });
    }
  }
};
