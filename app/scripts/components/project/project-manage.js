import template from './project-manage.html';

// @ngInject
class ProjectManageController {
  constructor(projectsService,
              currentStateService,
              customersService,
              WorkspaceService,
              ncUtilsFlash,
              $rootScope,
              $state,
              $q) {
    this.projectsService = projectsService;
    this.currentStateService = currentStateService;
    this.customersService = customersService;
    this.WorkspaceService = WorkspaceService;
    this.ncUtilsFlash = ncUtilsFlash;
    this.$rootScope = $rootScope;
    this.$state = $state;
    this.$q = $q;
  }

  $onInit() {
    this.canManage = false;
    this.projectModel = {};
    this.currentStateService.getCustomer().then(customer => {
      this.customer = customer;
    });
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
      this.ncUtilsFlash.success(gettext('Project has been updated'));
      // TODO: Migrate to Redux and make code DRY
      this.currentStateService.setProject(project);
      let item = this.customer.projects.filter(item => item.uuid === project.uuid)[0];
      item.name = project.name;
      this.WorkspaceService.setWorkspace({
        customer: this.customer,
        project: project,
        hasCustomer: true,
        workspace: 'project',
      });
    }, response => {
      this.errors = response.data;
    });
  }

  removeProject() {
    var confirmDelete = confirm(gettext('Confirm deletion?'));
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

const projectManage = {
  template: template,
  controller: ProjectManageController,
};

export default projectManage;
