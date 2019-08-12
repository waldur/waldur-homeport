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

class IssueRegistrationController {
  // @ngInject
  constructor($state,
              $scope,
              $q,
              $uibModal,
              ENV,
              features,
              issuesService,
              ncUtilsFlash,
              usersService,
              issueUsersService,
              issuePrioritiesService,
              customersService,
              projectsService,
              resourcesService,
              ErrorMessageFormatter,
              coreUtils) {
    this.$state = $state;
    this.$scope = $scope;
    this.$q = $q;
    this.$uibModal = $uibModal;
    this.ENV = ENV;
    this.features = features;
    this.service = issuesService;
    this.issue = {};
    this.ncUtilsFlash = ncUtilsFlash;
    this.usersService = usersService;
    this.issueUsersService = issueUsersService;
    this.issuePrioritiesService = issuePrioritiesService;
    this.customersService = customersService;
    this.projectsService = projectsService;
    this.resourcesService = resourcesService;
    this.ErrorMessageFormatter = ErrorMessageFormatter;
    this.coreUtils = coreUtils;
    this.init();
  }

  init() {
    this.usersService.getCurrentUser().then(user => {
      this.currentUser = user;
    });
    this.issuePrioritiesService.getAll().then(priorities => {
      this.priorities = priorities;
    });
    this.$scope.$watch(() => this.issue.caller, () => {
      this.issue.customer = null;
      this.refreshCustomers();
    });
    this.$scope.$watch(() => this.issue.customer, () => {
      this.issue.project = null;
      this.refreshProjects();
    });
    this.$scope.$watch(() => this.issue.project, () => {
      this.issue.resource = null;
      this.refreshResources();
    });
    this.$scope.$watch(() => this.issue.scope, () => {
      this.issue.resource = null;
      this.refreshResources();
    });
    this.scopes = this.getScopes();
    this.emptyFieldMessage = gettext('You did not enter a field.');
  }

  getScopes() {
    const filterResourceType = resourceType => this.features.isVisible(
      this.ENV.resourceCategory[resourceType]
    );

    const formatChoice = resourceType => ({
      display_name: resourceType.split('.').join(' '),
      value: resourceType
    });

    const types = Object.keys(this.ENV.resourceCategory);
    return types.filter(filterResourceType).sort().map(formatChoice);
  }

  refreshUsers(name) {
    const params = name && {full_name: name};
    return this.usersService.getList(params).then(users => {
      this.users = users;
    });
  }

  refreshSupportUsers(name) {
    const params = name && {name: name};
    return this.issueUsersService.getList(params).then(users => {
      this.supportUsers = users;
    });
  }

  refreshCustomers(name) {
    if (!this.issue.caller) {
      return;
    }
    let params = {
      user_uuid: this.issue.caller.uuid
    };
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
    this.projectsService.filterByCustomer = false;
    let promise = this.projectsService.getList(params).then(projects => {
      this.projects = projects;
    });
    this.projectsService.filterByCustomer = true;
    return promise;
  }

  refreshResources(name) {
    if (!this.issue.project || !this.issue.scope) {
      return;
    }

    let params = {
      project_uuid: this.issue.project.uuid,
      resource_type: this.issue.scope.value,
      field: ['name', 'url']
    };
    if (name) {
      params.name = name;
    }
    this.resourcesService.filterByCustomer = false;
    let promise = this.resourcesService.getList(params).then(resources => {
      this.resources = resources;
    });
    this.resourcesService.filterByCustomer = true;
    return promise;
  }

  filterByCaller(caller) {
    return this.onSearch({
      filter: {caller}
    });
  }

  filterByCustomer(customer) {
    return this.onSearch({
      filter: {customer}
    });
  }

  filterByProject(project) {
    return this.onSearch({
      filter: {project}
    });
  }

  save() {
    this.IssueForm.$submitted = true;
    if (this.IssueForm.$invalid) {
      return this.$q.reject();
    }
    let issue = {
      type: this.issue.type,
      customer: this.issue.customer.url,
      summary: this.issue.summary,
      description: this.issue.description,
      caller: this.issue.caller.url
    };
    if (this.issue.project) {
      issue.project = this.issue.project.url;
    }
    if (this.issue.assignee) {
      issue.assignee = this.issue.assignee.url;
    }
    if (this.issue.resource) {
      issue.resource = this.issue.resource.url;
    }
    if (this.issue.priority) {
      issue.priority = this.issue.priority.name;
    }
    this.saving = true;
    return this.service.createIssue(issue).then(issue => {
      this.service.clearAllCacheForCurrentEndpoint();
      this.ncUtilsFlash.success(this.coreUtils.templateFormatter(gettext('Request {key} has been created.'), {key: issue.key}));
      return this.$state.go('support.detail', {uuid: issue.uuid});
    }).catch(response => {
      this.ncUtilsFlash.error(this.ErrorMessageFormatter.format(response));
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
      size: 'lg',
      resolve: {
        customer_uuid: () => customer.uuid,
      }
    });
  }
}
