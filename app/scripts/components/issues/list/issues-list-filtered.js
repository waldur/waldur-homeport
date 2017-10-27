import { ISSUE_FILTERS } from './constants';
import template from './issues-list-filtered.html';

// @ngInject
function IssueListFilteredController(features) {
  this.filterList = ISSUE_FILTERS;
  this.showFilters = features.isVisible('support.regular_issue_filters');
}

const issueListFiltered = {
  template: template,
  controller: IssueListFilteredController
};

export default issueListFiltered;
