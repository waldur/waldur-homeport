import template from './project-details.html';

class ProjectDetailsController {
  // @ngInject
  constructor(projectsService,
              currentStateService,
              customersService,
              ncUtilsFlash,
              $rootScope,
              $q) {
    this.projectsService = projectsService;
    this.currentStateService = currentStateService;
    this.customersService = customersService;
    this.ncUtilsFlash = ncUtilsFlash;
    this.$rootScope = $rootScope;
    this.$q = $q;
  }

  $onInit() {
    this.canManage = false;
    this.projectModel = {};
    this.loadData();
  }

  loadData() {
    this.projectModel = angular.copy(this.project);
    this.loading = true;
    this.$q.all([
      this.currentStateService.getCustomer().then(customer => {
        this.customer = customer;
      }),
      this.customersService.isOwnerOrStaff().then(canManage => {
        this.canManage = canManage;
      }),
    ]).finally(() => this.loading = false);
  }

  saveProject() {
    if (this.ProjectForm.$invalid) {
      return this.$q.reject();
    }

    return this.projectsService.updateProject(this.project.url, {
      name: this.projectModel.name,
      description: this.projectModel.description,
    }).then(response => {
      const project = response.data;
      this.ncUtilsFlash.success(gettext('Project has been updated.'));

      let item = this.customer.projects.filter(item => item.uuid === project.uuid)[0];
      item.name = project.name;

      this.$rootScope.$broadcast('refreshProjectList');
    }, response => {
      this.errors = response.data;
    });
  }
}

const projectDetails = {
  template: template,
  controller: ProjectDetailsController,
  bindings: {
    project: '<'
  }
};

export default projectDetails;
