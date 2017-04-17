import template from './project-manage.html';

// @ngInject
class ProjectManageController {
  constructor(projectsService,
              currentStateService,
              customersService,
              certificationsService,
              WorkspaceService,
              ncUtilsFlash,
              $rootScope,
              $state,
              $q) {
    this.projectsService = projectsService;
    this.currentStateService = currentStateService;
    this.customersService = customersService;
    this.certificationsService = certificationsService;
    this.WorkspaceService = WorkspaceService;
    this.ncUtilsFlash = ncUtilsFlash;
    this.$rootScope = $rootScope;
    this.$state = $state;
    this.$q = $q;
  }

  $onInit() {
    this.workspace = this.WorkspaceService.getWorkspace().workspace;
    this.canManage = false;
    this.projectModel = {};
    this.loading = true;
    this.$q.all([
      this.currentStateService.getCustomer().then(customer => {
        this.customer = customer;
      }),
      this.customersService.isOwnerOrStaff().then(canManage => {
        this.canManage = canManage;
      }),
      this.certificationsService.getAll().then(certifications => {
        this.certifications = certifications;
      }),
      this.loadProject(),
    ]).then(() => {
      this.projectCertifications = angular.copy(this.project.certifications);
      this.certificationsList = this.project.certifications.map(x => x.name).join(', ');
    }).finally(() => this.loading = false);
  }

  loadProject() {
    if (this.project) {
      this.projectModel = angular.copy(this.project);
      return;
    }
    return this.currentStateService.getProject().then(project => {
      this.project = project;
      this.projectModel = angular.copy(project);
    });
  }

  saveProject() {
    if (this.ProjectForm.$invalid) {
      return this.$q.reject();
    }
    return this.updateProject();
  }

  updateProject() {
    return this.projectsService.updateProject(this.project.url, {
      name: this.projectModel.name,
      description: this.projectModel.description,
    }).then(response => {
      const project = response.data;
      this.ncUtilsFlash.success(gettext('Project has been updated.'));

      let item = this.customer.projects.filter(item => item.uuid === project.uuid)[0];
      item.name = project.name;

      if (this.workspace === 'organization') {
        this.$rootScope.$broadcast('refreshProjectList');
        return;
      }
      // TODO: Migrate to Redux and make code DRY
      this.currentStateService.setProject(project);
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

  updateCertifications() {
    function mapItems(items) {
      return items.map(item => ({url: item.url}));
    }
    const oldItems = mapItems(this.project.certifications);
    const newItems = mapItems(this.projectCertifications);
    if (angular.equals(oldItems, newItems)) {
      return this.$q.resolve();
    } else {
      return this.projectsService.updateCertifications(this.project.url, newItems).then(() => {
        this.projectsService.clearAllCacheForCurrentEndpoint();

        if (this.workspace === 'organization') {
          this.$rootScope.$broadcast('refreshProjectList');
          return;
        }
      });
    }
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
  bindings: {
    project: '<'
  }
};

export default projectManage;
