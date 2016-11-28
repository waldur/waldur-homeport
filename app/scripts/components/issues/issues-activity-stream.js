import template from './issues-activity-stream.html';

export default function issuesActivityStream() {
  return {
    restrict: 'E',
    template: template,
    controller: IssuesActivityStreamController,
    controllerAs: '$ctrl',
    scope: {},
    bindToController: true
  };
}

// @ngInject
function IssuesActivityStreamController(FakeIssueCommentsService) {
  this.loading = true;
  FakeIssueCommentsService.getList().then(items => {
    this.items = items;
    this.loading = false;
  });
}
