import template from './issue-detail.html';

export default function issueDetail() {
  return {
    restrict: 'E',
    template: template,
    controller: IssueDetailController,
    controllerAs: '$ctrl',
    scope: {},
    bindToController: true
  };
}

// @ngInject
class IssueDetailController {
  constructor($stateParams, $state, $rootScope, issuesService) {
    this.$stateParams = $stateParams;
    this.$state = $state;
    this.$rootScope = $rootScope;
    this.issuesService = issuesService;
    this.init();
  }

  init() {
    this.loading = true;
    this.getIssue().then(issue => {
      this.issue = issue;
    }).catch(this.onError.bind(this)).finally(() => {
      this.loading = false;
    });
  }

  getIssue() {
    return this.issuesService.$get(this.$stateParams.uuid);
  }

  onError(error) {
    if (error.status == 404) {
      this.$state.go('errorPage.notFound');
    }
  }

  onCommentCreated() {
    this.$rootScope.$emit('refreshCommentsList');
  }
}
