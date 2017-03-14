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

// @ngInject
class IssueQuickCreateController {
  constructor($state,
              $scope,
              $q,
              issuesService,
              ncUtilsFlash,
              customersService,
              projectsService,
              resourcesService) {
    this.$state = $state;
    this.$scope = $scope;
    this.$q = $q;
    this.service = issuesService;
    this.issue = {};
    this.ncUtilsFlash = ncUtilsFlash;
    this.customersService = customersService;
    this.projectsService = projectsService;
    this.resourcesService = resourcesService;
    this.init();
  }

  init() {
    this.$scope.$watch(() => this.issue.customer, () => {
      this.issue.project = null;
      this.refreshProjects();
    });
    this.$scope.$watch(() => this.issue.project, () => {
      this.issue.resource = null;
      this.refreshResources();
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
      this.ncUtilsFlash.success(`${issue.key} ${gettext('request has been created')}`);
      return this.$state.go('support.detail', {uuid: issue.uuid});
    }).finally(() => {
      this.saving = false;
    });
  }
}
