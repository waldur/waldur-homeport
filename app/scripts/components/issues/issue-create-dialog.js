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

const DEFAULT_OPTIONS = {
  title: 'Create request',
  hideTitle: false,
  descriptionLabel: 'Request description',
  descriptionPlaceholder: 'Request description',
  summaryLabel: 'Request name',
  summaryPlaceholder: 'Request name',
  submitTitle: 'Create'
};

// @ngInject
class IssueCreateDialogController {
  constructor(issuesService, $q, $state, ncUtilsFlash, ISSUE_IDS) {
    this.service = issuesService;
    this.$q = $q;
    this.$state = $state;
    this.ncUtilsFlash = ncUtilsFlash;
    this.ISSUE_IDS = ISSUE_IDS;
    this.issue = this.resolve.issue || {};
    this.options = angular.extend({}, DEFAULT_OPTIONS, this.resolve.options);
  }

  save() {
    this.IssueForm.$submitted = true;
    if (this.IssueForm.$invalid) {
      return this.$q.reject();
    }
    let issue = {
      type: this.issue.type || this.ISSUE_IDS.CHANGE_REQUEST,
      summary: this.issue.summary,
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
    return this.service.createIssue(issue).then(issue => {
      this.service.clearAllCacheForCurrentEndpoint();
      this.ncUtilsFlash.success(`Request ${issue.key} has been created`);
      return this.$state.go('support.detail', {uuid: issue.uuid}).then(() => {
        this.close();
      });
    }).finally(() => {
      this.saving = false;
    });
  }
}
