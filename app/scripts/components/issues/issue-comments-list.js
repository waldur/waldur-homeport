import template from './issue-comments-list.html';

export default function issueCommentsList() {
  return {
    restrict: 'E',
    template: template,
    controller: IssueCommentsListController,
    controllerAs: '$ctrl',
    scope: {
      issue: '='
    },
    bindToController: true
  };
}

class IssueCommentsListController {
  constructor(issueCommentsService, $scope, $rootScope) {
    this.issueCommentsService = issueCommentsService;
    this.$scope = $scope;
    this.$rootScope = $rootScope;
    this.init();
  }

  init() {
    var unbind = this.$rootScope.$on('refreshCommentsList', () => {
      this.issueCommentsService.clearAllCacheForCurrentEndpoint();
      this.refresh();
    });
    this.$scope.$on('$destroy', () => {
      unbind();
    });
    this.refresh();
  }

  refresh() {
    this.loading = true;
    this.issueCommentsService.getAll({
      issue_uuid: this.issue.uuid
    }).then(comments => {
      this.comments = comments;
    }).catch(response => {
      this.erred = true;
    }).finally(() => {
      this.loading = false;
    });
  }
}
