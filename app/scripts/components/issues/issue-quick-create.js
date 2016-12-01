import { ISSUE_TYPE_CHOICES } from './constants';
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
  this.issueTypes = ISSUE_TYPE_CHOICES;
  this.contextItems = [
    {
      label: 'Organization'
    },
    {
      label: 'Project'
    },
    {
      label: 'Affected resource'
    }
  ];
}
