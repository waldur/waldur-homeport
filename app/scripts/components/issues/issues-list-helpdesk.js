import {
  ISSUE_FILTERS_SHORT,
  ISSUE_TYPE_CHOICES,
  ISSUE_STATUS_CHOICES
} from './constants';
import { CUSTOMERS } from './fake-issues-service';
import { USERS } from './fixtures';
import template from './issues-list-helpdesk.html';

export default function issuesListHelpdesk() {
  return {
    restrict: 'E',
    template: template,
    controller: IssuesListHelpdeskController,
    controllerAs: '$ctrl',
    scope: {},
    bindToController: true
  };
}

// @ngInject
class IssuesListHelpdeskController {
  constructor($state) {
    this.$state = $state;
    this.init();
  }

  init() {
    let order = ISSUE_FILTERS_SHORT.order;
    this.filters = order.map(field => angular.extend({ name: field }, options[field]));
    this.filter = {};
  }

  createIssue() {
    this.$state.go('support.createIssue');
  }
}

const choices = {
  customer: {
    options: CUSTOMERS
  },
  type: {
    options: ISSUE_TYPE_CHOICES
  },
  status: {
    options: ISSUE_STATUS_CHOICES
  },
  caller: {
    options: USERS
  }
};

const options = angular.merge({}, choices, ISSUE_FILTERS_SHORT.options);
