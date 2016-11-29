import { ISSUE_TYPES, ISSUE_ICONS, ISSUE_TEXT_CLASSES } from './constants';
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
  this.issueTypes = ISSUE_TYPES.map(item => {
    return {
      iconClass: ISSUE_ICONS[item],
      textClass: ISSUE_TEXT_CLASSES[item],
      label: item
    };
  });
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
