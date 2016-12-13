import template from './issues-helpdesk.html';

export default function issuesHelpdesk() {
  return {
    restrict: 'E',
    template: template,
    controller: IssuesHelpdeskController,
    controllerAs: '$ctrl',
    scope: {},
    bindToController: true
  };
}

class IssuesHelpdeskController {
  constructor() {
    this.listFilter = {};
  }

  onSearch(issue) {
    if (!issue) {
      this.listFilter = {};
      return;
    }
    let filter = {};
    if (issue.caller) {
      filter.caller = issue.caller.url;
    }
    if (issue.customer) {
      filter.customer = issue.customer.url;
    }
    if (issue.project) {
      filter.project = issue.project.url;
    }
    if (issue.summary) {
      filter.summary = issue.summary;
    }
    this.listFilter = filter;
  }
}
