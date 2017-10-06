import template from './project-create.html';

const projectCreate = {
  template: template,
  controller: ProjectAddController,
  controllerAs: 'ProjectAdd',
};

export default projectCreate;

// @ngInject
function ProjectAddController(
  projectsService,
  currentStateService,
  certificationsService,
  baseControllerAddClass,
  $q,
  $rootScope,
  $state,
  ncUtils,
  ncUtilsFlash) {
  let controllerScope = this;
  let ProjectController = baseControllerAddClass.extend({
    userRole: 'admin',
    init: function() {
      this.service = projectsService;
      this.controllerScope = controllerScope;
      this._super();
      this.detailsState = 'project.details';
      this.redirectToDetailsPage = true;
      this.project = this.instance;
      this.certifications = [];
      this.projectCertifications = [];
    },
    activate: function() {
      this.loading = true;
      $q.all([
        this.loadCustomer(),
        this.loadCertificates()
      ]).finally(() => this.loading = false);
    },
    loadCustomer: function() {
      return currentStateService.getCustomer().then(customer => {
        this.project.customer = customer.url;
        if (ncUtils.isCustomerQuotaReached(customer, 'project')) {
          $state.go('errorPage.limitQuota');
        }
      });
    },
    loadCertificates: function() {
      return certificationsService.getAll().then(certifications => {
        this.certifications = certifications;
      });
    },
    beforeSave: function() {
      this.project.certifications = this.projectCertifications.map(item => ({url: item.url}));
    },
    save: function () {
      //validation needed
      if(!this.project.name) {
        ncUtilsFlash.error('Enter the project name');
        return;
      }
      currentStateService.getCustomer().then(organization => {
        let projects = organization.projects;
        for (let i = 0; i < projects.length; i++) {
          if(projects[i].name === this.project.name) {
            //send error message
            ncUtilsFlash.error('Change project name');
            return;
          }
        }
        baseControllerAddClass.prototype.save.call(this);
      });
    },
    afterSave: function(project) {
      $rootScope.$broadcast('refreshProjectList', {
        model: project, new: true, current: true
      });
      this._super();
    },
    onError: function(errorObject) {
      ncUtilsFlash.error(errorObject.data.detail);
    },
    cancel: function() {
      currentStateService.getCustomer().then(function(customer) {
        $state.go('organization.projects', {uuid: customer.uuid});
      });
    }
  });

  controllerScope.__proto__ = new ProjectController();
}
