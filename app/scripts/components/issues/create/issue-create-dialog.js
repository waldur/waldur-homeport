import template from './issue-create-dialog.html';

const DEFAULT_OPTIONS = {
  title: gettext('Create request'),
  hideTitle: false,
  descriptionLabel: gettext('Request description'),
  descriptionPlaceholder: gettext('Request description'),
  summaryLabel: gettext('Request name'),
  summaryPlaceholder: gettext('Request name'),
  submitTitle: gettext('Create')
};

const issueCreateDialog = {
  template,
  bindings: {
    close: '&',
    dismiss: '&',
    resolve: '<'
  },
  controller: class IssueCreateDialogController {
    // @ngInject
    constructor(issuesService, $q, $state, ncUtilsFlash, IssueTypesService, ErrorMessageFormatter, coreUtils) {
      this.service = issuesService;
      this.$q = $q;
      this.$state = $state;
      this.ncUtilsFlash = ncUtilsFlash;
      this.IssueTypesService = IssueTypesService;
      this.ErrorMessageFormatter = ErrorMessageFormatter;
      this.coreUtils = coreUtils;
    }

    $onInit() {
      this.IssueTypesService.getDefaultType().then(defaultType => {
        this.issue = angular.copy(this.resolve.issue) || {};
        if (!this.issue.type) {
          this.issue.type = defaultType;
          this.issueTypeEditable = true;
        }
        this.options = angular.extend({}, DEFAULT_OPTIONS, this.resolve.options);
        this.emptyFieldMessage = gettext('You did not enter a field.');
      });
    }

    getDescription() {
      if (this.resolve.issue.additionalDetails) {
        return `${this.issue.description}. \n\nRequest details: ${this.resolve.issue.additionalDetails}`;
      }

      return this.issue.description;
    }

    save() {
      this.IssueForm.$submitted = true;
      if (this.IssueForm.$invalid) {
        return this.$q.reject();
      }
      let issue = {
        type: this.issue.type,
        summary: this.issue.summary,
        description: this.getDescription(),
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
        this.ncUtilsFlash.success(this.coreUtils.templateFormatter(gettext('Request {requestId} has been created.'), {requestId: issue.key}));
        return this.$state.go('support.detail', {uuid: issue.uuid}).then(() => {
          this.close();
        });
      }).catch(response => {
        this.ncUtilsFlash.error(this.ErrorMessageFormatter.format(response));
      }).finally(() => {
        this.saving = false;
      });
    }
  }
};

export default issueCreateDialog;
