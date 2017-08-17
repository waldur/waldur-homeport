import { ISSUE_FILTERS } from './constants';
import template from './issues-list-filtered.html';

const issueListFiltered = {
  template: template,
  controller: function IssueListFilteredController(features) {
    this.filterList = ISSUE_FILTERS;
    this.showFilters = features.isVisible('support.regular_issue_filters');
  }
};

export default issueListFiltered;
