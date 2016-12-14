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
function IssuesActivityStreamController(issueCommentsService, $uibModal) {
  this.loading = true;
  issueCommentsService.getList().then(items => {
    this.items = items;
    this.loading = false;
  });

  this.openUserDialog = function(user) {
    $uibModal.open({
      component: 'userPopover',
      resolve: {
        user: () => user
      }
    });
  };
}
