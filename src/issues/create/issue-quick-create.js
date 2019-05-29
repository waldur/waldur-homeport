import template from './issue-quick-create.html';

export default function issueQuickCreate() {
  return {
    restrict: 'E',
    template: template,
    controller: IssueQuickCreateController,
    controllerAs: '$ctrl',
    scope: {},
    bindToController: true
  };
}

class IssueQuickCreateController {
  // @ngInject
  constructor($state,
              $scope,
              $q,
              issuesService,
              ncUtilsFlash,
              customersService,
              projectsService,
              resourcesService,
              usersService,
              ErrorMessageFormatter,
              coreUtils) {
    this.$state = $state;
    this.$scope = $scope;
    this.$q = $q;
    this.service = issuesService;
    this.issue = {};
    this.ncUtilsFlash = ncUtilsFlash;
    this.customersService = customersService;
    this.projectsService = projectsService;
    this.resourcesService = resourcesService;
    this.usersService = usersService;
    this.ErrorMessageFormatter = ErrorMessageFormatter;
    this.coreUtils = coreUtils;
    this.init();
  }

  init() {
    this.$scope.$watch(() => this.issue.customer, () => {
      this.issue.project = null;
      this.refreshProjects();
      this.refreshProjectRequired();
    });
    this.$scope.$watch(() => this.issue.project, () => {
      this.issue.resource = null;
      this.refreshResources();
    });
    this.emptyFieldMessage = gettext('You did not enter a field.');
    this.projectRequired = false;
    this.usersService.getCurrentUser().then(user => {
      this.user = user;
    });
  }

  refreshCustomers(name) {
    let params = {};
    if (name) {
      params.name = name;
    }
    return this.customersService.getList(params).then(customers => {
      this.customers = customers;
    });
  }

  refreshProjectRequired() {
    // Project should be specified only if user has selected customer
    // but user is not owner and user is not staff and user is not customer owner.

    if (!this.issue.customer) {
      this.projectRequired = false;
      return;
    }

    if (this.user.is_staff || this.user.is_support) {
      return;
    }

    this.projectRequired = this.issue.customer.owners.find(
      owner => owner.uuid === this.user.uuid) === undefined;
  }

  refreshProjects(name) {
    if (!this.issue.customer) {
      return;
    }
    let params = {
      customer: this.issue.customer.uuid
    };
    if (name) {
      params.name = name;
    }
    return this.projectsService.getList(params).then(projects => {
      this.projects = projects;
    });
  }

  refreshResources(name) {
    if (!this.issue.project) {
      return;
    }

    let params = {
      project_uuid: this.issue.project.uuid,
      field: ['name', 'url']
    };
    if (name) {
      params.name = name;
    }
    return this.resourcesService.getList(params).then(resources => {
      this.resources = resources;
    });
  }

  save() {
    this.IssueForm.$submitted = true;
    if (this.IssueForm.$invalid) {
      return this.$q.reject();
    }
    let issue = {
      type: this.issue.type,
      summary: this.issue.summary,
      description: this.issue.description,
      is_reported_manually: true,
    };

    if (this.issue.resource) {
      issue.resource = this.issue.resource.url;
    } else if (this.issue.project) {
      issue.project = this.issue.project.url;
    } else if (this.issue.customer) {
      issue.customer = this.issue.customer.url;
    }

    this.saving = true;
    return this.service.createIssue(issue).then(issue => {
      this.service.clearAllCacheForCurrentEndpoint();
      this.ncUtilsFlash.success(this.coreUtils.templateFormatter(gettext('Request {requestId} has been created.'), {requestId: issue.key}));
      return this.$state.go('support.detail', {uuid: issue.uuid});
    }).catch(response => {
      this.ncUtilsFlash.error(this.ErrorMessageFormatter.format(response));
    }).finally(() => {
      this.saving = false;
    });
  }
}
