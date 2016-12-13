import { ISSUE_TYPE_CHOICES } from './constants';
import template from './issue-registration.html';

export default function issueRegistration() {
  return {
    restrict: 'E',
    template: template,
    controller: IssueRegistrationController,
    controllerAs: '$ctrl',
    scope: {
      onSearch: '&'
    },
    bindToController: true
  };
}

// @ngInject
class IssueRegistrationController {
  constructor($state,
              $scope,
              $q,
              $uibModal,
              issuesService,
              IssueFilterService,
              ncUtilsFlash) {
    this.$state = $state;
    this.$scope = $scope;
    this.$q = $q;
    this.$uibModal = $uibModal;
    this.service = issuesService;
    this.issue = {};
    this.types = ISSUE_TYPE_CHOICES;
    this.filterService = IssueFilterService;
    this.ncUtilsFlash = ncUtilsFlash;
    this.init();
  }

  init() {
    this.$scope.$watch(() => this.issue.caller, caller => {
      this.issue.customer = null;
    });
    this.$scope.$watch(() => this.issue.customer, customer => {
      this.issue.project = null;
    });
    this.$scope.$watch(() => this.issue.project, project => {
      this.issue.resource = null;
    });
  }

  save() {
    this.IssueForm.$submitted = true;
    if (this.IssueForm.$invalid) {
      return this.$q.reject();
    }
    let issue = {
      type: this.issue.type.id,
      customer: this.issue.customer.url,
      project: this.issue.project.url,
      summary: this.issue.summary,
      description: this.issue.description,
      caller: this.issue.caller.url
    };
    if (this.issue.resource) {
      issue.resource = this.issue.resource.url;
    }
    this.saving = true;
    return this.service.createIssue(issue).then(issue => {
      this.service.clearAllCacheForCurrentEndpoint();
      this.ncUtilsFlash.success(`Issue ${issue.key} has been created`);
      return this.$state.go('support.detail', {uuid: issue.uuid});
    }).finally(() => {
      this.saving = false;
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
