import { CUSTOMERS } from './fake-issues-service';
import { USERS } from './fixtures';
import { ISSUE_TYPE_CHOICES } from './constants';
import template from './issue-create-page.html';

export default function issueCreatePage() {
  return {
    restrict: 'E',
    template: template,
    controller: IssueCreatePageController,
    controllerAs: '$ctrl',
    scope: {},
    bindToController: true
  };
}

class IssueCreatePageController {
  constructor(FakeIssuesService, $state, $uibModal) {
    this.service = FakeIssuesService;
    this.issue = angular.copy(this.service.filter);
    this.customers = CUSTOMERS;
    this.users = USERS;
    this.types = ISSUE_TYPE_CHOICES;
    this.$state = $state;
    this.$uibModal = $uibModal;
  }

  save() {
    return this.service.createIssue(this.issue).then(() => {
      return this.$state.go('support.helpdesk')
    });
  }

  openUserDialog(user) {
    if (!user) {
      return;
    }
    this.$uibModal.open({
      component: 'userPopover',
      resolve: {
        user: () => user
      }
    });
  }

  openCustomerDialog(customer) {
    if (!customer) {
      return;
    }
    this.$uibModal.open({
      component: 'customerPopover',
      resolve: {
        customer: () => customer
      }
    });
  }
}
