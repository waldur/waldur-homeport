import { ISSUE_CLASSES } from './constants';
import template from './issues-short-list.html';

export default function issuesShortList() {
  return {
    restrict: 'E',
    template: template,
    controller: IssuesShortListController,
    controllerAs: '$ctrl',
    scope: {
      label: '=',
      filter: '='
    },
    bindToController: true
  };
}

// ngInject
function IssuesShortListController(FakeIssuesService) {
  this.loading = true;
  FakeIssuesService.getList(this.filter).then(items => {
    this.items = items.map(item => {
      item.labelClass = ISSUE_CLASSES[item.type];
      return item;
    });
    this.loading = false;
  });
}
