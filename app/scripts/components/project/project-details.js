import template from './project-details.html';

class ProjectDetailsController {
  // @ngInject
  constructor(projectsService,
              currentStateService,
              customersService,
              projectValidationService,
              ncUtilsFlash,
              $rootScope,
              ErrorMessageFormatter,
              $q) {
    this.projectsService = projectsService;
    this.currentStateService = currentStateService;
    this.customersService = customersService;
    this.projectValidationService = projectValidationService;
    this.ncUtilsFlash = ncUtilsFlash;
    this.$rootScope = $rootScope;
    this.ErrorMessageFormatter = ErrorMessageFormatter;
    this.$q = $q;
    this.projectsAll = [];
    this.errors = {};
    this.canManage = false;
    this.projectModel = {};
  }

  $onInit() {
    this.loadData();
  }

  loadData() {
    this.projectModel = angular.copy(this.project);
    this.loading = true;
    this.$q.all([
      this.currentStateService.getCustomer().then(customer => {
        this.customer = customer;
        this.projectsAll = customer.projects.filter((currProject) => {
          return this.project.name !== currProject.name;
        });
      }),
      this.customersService.isOwnerOrStaff().then(canManage => {
        this.canManage = canManage;
      }),
    ]).finally(() => this.loading = false);
  }

  validate() {
    let response = this.projectValidationService.validate({
      projects: this.projectsAll,
      form: this.ProjectForm
    });
    this.errors = {};

    if (response === true) {
      return true;
    }
    this.errors = response;
    return false;
  }

  saveProject() {
    if (!this.validate()) return;
    return this.projectsService.updateProject(this.project.url, {
      name: this.projectModel.name,
      description: this.projectModel.description,
    })
    .then(response => {
      const project = response.data;
      this.ncUtilsFlash.success(gettext('Project has been updated.'));

      let item = this.customer.projects.filter(item => item.uuid === project.uuid)[0];
      this.project.name = item.name = project.name;
      this.project.description = item.description = project.description;

      this.$rootScope.$broadcast('refreshProjectList');
    }, response => {
      this.ncUtilsFlash.errorFromResponse(response, gettext('Project could not be updated.'));
      angular.merge(this.errors, this.ErrorMessageFormatter.parseError(response));
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
