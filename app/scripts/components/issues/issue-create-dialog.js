import { ISSUE_TYPE_CHOICES } from './constants';
import template from './issue-create-dialog.html';

export default function issueCreateDialog() {
  return {
    restrict: 'E',
    template: template,
    controller: IssueCreateDialogController,
    controllerAs: '$ctrl',
    scope: {},
    bindToController: {
      close: '&',
      dismiss: '&',
      resolve: '='
    }
  };
}

// @ngInject
class IssueCreateDialogController {
  constructor(issuesService, $q, $state, ncUtilsFlash) {
    this.service = issuesService;
    this.$q = $q;
    this.$state = $state;
    this.ncUtilsFlash = ncUtilsFlash;
    this.types = ISSUE_TYPE_CHOICES;
    this.issue = this.resolve.issue || {};
    this.options = this.setOptions(this.resolve.options);
  }

  save() {
    this.IssueForm.$submitted = true;
    if (this.IssueForm.$invalid) {
      return this.$q.reject();
    }
    let issue = {
      type: this.options.issueType,
      summary: this.issue.summary || this.options.issueSummary,
      description: this.issue.description,
      is_reported_manually: true
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
    this.saving = true;
    let promise = null;
    if (this.options.type === 'add_service') {
      promise = this.service.createServiceRequest(issue);
    } else {
      promise = this.service.createChangeRequest(issue);
    }
    return promise.then(issue => {
      this.service.clearAllCacheForCurrentEndpoint();
      this.ncUtilsFlash.success(`Request ${issue.key} has been created`);
      return this.$state.go('support.detail', {uuid: issue.uuid}).then(() => {
        this.close();
      });
    }).finally(() => {
      this.saving = false;
    });
  }

  setOptions(options) {
    return {
      type: options.type || null,
      title: options.title ||'Add ticket',
      descriptionLabel: options.descriptionLabel || 'Ticket description',
      descriptionPlaceholder: options.descriptionPlaceholder || 'Problem description',
      summaryLabel: options.summaryLabel ||  'Ticket name',
      submitTitle: options.submitTitle|| 'Create',
      issueSummary: options.issueSummary || '',
      issueType: options.issueType || 'Change request'
    }
  }
}
