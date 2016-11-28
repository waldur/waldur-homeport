import template from './issue-quick-create.html';

export default function issueQuickCreate() {
  return {
    restrict: 'E',
    template: template,
    controller: IssueQuickCreateController,
    controllerAs: '$ctrl',
    scope: {},
    bindToController: true
  };
}

function IssueQuickCreateController() {
  this.issue = {};
}
