import { ISSUE_TYPE_CHOICES } from './constants';
import template from './issue-registration.html';

export default function issueCreatePage() {
  return {
    restrict: 'E',
    template: template,
    controller: IssueCreatePageController,
    controllerAs: '$ctrl',
    scope: {
      onSearch: '&'
    },
    bindToController: true
  };
}

// @ngInject
class IssueCreatePageController {
  constructor($state,
              $q,
              $uibModal,
              issuesService,
              IssueFilterService) {
    this.$state = $state;
    this.$q = $q;
    this.$uibModal = $uibModal;
    this.service = issuesService;
    this.issue = angular.copy(this.service.filter);
    this.types = ISSUE_TYPE_CHOICES;
    this.filterService = IssueFilterService;
  }

  save() {
    if (this.IssueForm.$invalid) {
      return this.$q.reject();
    }
    let issue = {
      type: this.issue.type.id,
      summary: this.issue.summary,
      description: this.issue.description,
      reporter: this.issue.caller.url
    };
    if (this.issue.customer) {
      issue.customer = this.issue.customer.url;
    }
    if (this.issue.project) {
      issue.project = this.issue.project.url;
    }
    if (this.issue.resource) {
      issue.resource = this.issue.resource.url;
    }
    return this.service.createIssue(issue).then(() => {
      this.service.clearAllCacheForCurrentEndpoint();
      return this.$state.go('support.helpdesk');
    });
  }

  openUserDialog(user) {
    this.$uibModal.open({
      component: 'userPopover',
      resolve: {
        user: () => user
      }
    });
  }

  openCustomerDialog(customer) {
    this.$uibModal.open({
      component: 'customerPopover',
      resolve: {
        customer: () => customer
      }
    });
  }
}
