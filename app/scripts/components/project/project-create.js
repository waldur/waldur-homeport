import template from './project-create.html';
import {BaseControllerAddClass} from './../controllers/base-controller-class-es6';

class ProjectAddController extends BaseControllerAddClass {
  // @ngInject
  constructor(projectsService,
              certificationsService,
              projectValidationService,
              $q,
              ncUtils,
              $injector) {
    super($injector);
    this.$injector = $injector;
    this.certificationsService = certificationsService;
    this.projectsService = projectsService;
    this.projectValidationService = projectValidationService;
    this.$q = $q;
    this.ncUtils = ncUtils;
    this.detailsState = 'project.details';
    this.redirectToDetailsPage = true;
    this.certifications = [];
    this.projectCertifications = [];
    this.projectsAll = [];
  }

  $onInit() {
    super.$onInit(this.projectsService);
    this.project = this.instance;
    this.activate();
  }

  activate() {
    this.loading = true;
    this.$q.all([
      this.loadCustomer(),
      this.loadCertificates()
    ]).finally(() => {
      this.loading = false;
    });
  }

  loadCustomer() {
    return this.currentStateService.getCustomer().then(customer => {
      this.project.customer = customer.url;
      this.projectsAll = customer.projects;
      if (this.ncUtils.isCustomerQuotaReached(customer, 'project')) {
        this.$state.go('errorPage.limitQuota');
      }
    });
  }

  loadCertificates() {
    return this.certificationsService.getAll().then(certifications => {
      this.certifications = certifications;
    });
  }

  validate() {
    let response = this.projectValidationService.validate({
      projects: this.projectsAll,
      form: this.form
    });
    this.errors = {};

    if (response === true) {
      return true;
    }
    this.errors = response;
    return false;
  }

  beforeSave() {
    this.project.certifications = this.projectCertifications.map(item => ({url: item.url}));
  }

  save() {
    if (!this.validate()) return;
    super.save();
  }

  afterSave(project) {
    this.$rootScope.$broadcast('refreshProjectList', {
      model: project, new: true, current: true
    });
  }

  onError(errorObject) {
    this.ncUtilsFlash.errorFromResponse(errorObject, gettext('Project could not be created.'));
  }

  cancel() {
    this.currentStateService.getCustomer().then((customer) => {
      this.$state.go('organization.projects', {uuid: customer.uuid});
    });
  }
}

const projectCreate = {
  template: template,
  controller: ProjectAddController
};

export default projectCreate;
