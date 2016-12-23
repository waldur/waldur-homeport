import template from './project-manage.html';

export default function projectManage() {
  return {
    restrict: 'E',
    template: template,
    controller: ProjectManageController,
    controllerAs: '$ctrl',
    scope: {},
    bindToController: true
  };
}

// @ngInject
class ProjectManageController {
  constructor(projectsService,
              currentStateService,
              customersService,
              $rootScope,
              $state,
              $q) {
    this.projectsService = projectsService;
    this.currentStateService = currentStateService;
    this.customersService = customersService;
    this.$rootScope = $rootScope;
    this.$state = $state;
    this.$q = $q;
    this.activate();
  }

  activate() {
    this.canManage = false;
    this.projectModel = {};
    this.currentStateService.getProject().then(project => {
      this.project = project;
      this.projectModel = angular.copy(project);
    });
    this.customersService.isOwnerOrStaff().then(canManage => {
      this.canManage = canManage;
    });
  }

  saveProject() {
    if (this.ProjectForm.$invalid) {
      return this.$q.reject();
    }
    return this.projectsService.$update(null, this.project.url, this.projectModel).then(project => {
      this.$rootScope.$broadcast('adjustCurrentProject', project);
    }, response => {
      this.errors = response.data;
    });
  }

  removeProject() {
    var confirmDelete = confirm('Confirm deletion?');
    if (!confirmDelete) {
      return this.$q.reject();
    }
    this.currentStateService.setProject(null);
    return this.project.$delete().then(() => {
      this.projectsService.clearAllCacheForCurrentEndpoint();
      return this.projectsService.getFirst().then(project => {
        this.currentStateService.setProject(project);
        this.$rootScope.$broadcast('refreshProjectList', {model: this.project, remove: true});
      });
    }, () => {
      this.currentStateService.setProject(this.project);
    }).then(() => {
      this.currentStateService.reloadCurrentCustomer(customer => {
        this.$rootScope.$broadcast('checkQuotas:refresh');
        this.$rootScope.$broadcast('customerBalance:refresh');
        this.$state.go('organization.projects', {uuid: customer.uuid});
      });
    });
  }
}
