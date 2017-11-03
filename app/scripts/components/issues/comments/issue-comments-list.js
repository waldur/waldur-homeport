import template from './issue-comments-list.html';

const issueCommentsList = {
  template,
  bindings: {
    issue: '<',
    users: '<',
  },
  controller: class IssueCommentsListController {
    // @ngInject
    constructor(issueCommentsService, usersService, $rootScope, $uibModal) {
      this.issueCommentsService = issueCommentsService;
      this.usersService = usersService;
      this.$rootScope = $rootScope;
      this.$uibModal = $uibModal;
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

    openUserDialog(user_uuid) {
      this.$uibModal.open({
        component: 'userPopover',
        resolve: {
          user_uuid: () => user_uuid
        }
      });
    }

    loadComments() {
      return this.usersService.getCurrentUser().then(user => {
        return this.issueCommentsService.getIssueComments(this.issue.uuid, user);
      });
    }
  }
};

export default issueCommentsList;
