import {
  ISSUE_FILTERS_SHORT,
  ISSUE_TYPE_CHOICES,
  ISSUE_STATUS_CHOICES
} from './constants';
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
    this.listFilter = {};
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

  search() {
    this.listFilter = angular.copy(this.filter);
  }
}

const choices = {
  customer: {
    options: []
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
