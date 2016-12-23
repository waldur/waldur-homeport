import { ISSUE_FILTERS } from './constants';
import template from './issues-list-filtered.html';

export default function issueListFiltered() {
  return {
    restrict: 'E',
    template: template,
    controller: IssueListFilteredController,
    controllerAs: '$ctrl',
    scope: {},
    bindToController: true
  };
}

function IssueListFilteredController() {
  this.filterList = ISSUE_FILTERS;
}
