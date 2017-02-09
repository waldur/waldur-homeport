import template from './offering-details.html';

const offeringDetails = {
  template,
  controller: class OfferingDetailsController {
    constructor(
      offeringsService,
      projectsService,
      customersService,
      currentStateService,
      WorkspaceService,
      $stateParams,
      $state) {
      this.offeringsService = offeringsService;
      this.projectsService = projectsService;
      this.customersService = customersService;
      this.currentStateService = currentStateService;
      this.WorkspaceService = WorkspaceService;
      this.$stateParams = $stateParams;
      this.$state = $state;
    }

    $onInit() {
      this.offeringsService.$get(this.$stateParams.uuid)
        .then(offering => {
          this.offering = offering;
          return this.projectsService.$get(offering.project_uuid).then(project => {
            this.currentStateService.setProject(project);
            return { project };
          });
        })
        .then(({ project }) => {
          return this.customersService.$get(project.customer_uuid).then(customer => {
            this.currentStateService.setCustomer(customer);
            return { customer, project };
          });
        }).then(({ customer, project }) => {
          this.WorkspaceService.setWorkspace({
            customer: customer,
            project: project,
            hasCustomer: true,
            workspace: 'project',
          });
        })
        .catch(() => {
          this.$state.go('errorPage.notFound');
        });
    }
  }
};

export default offeringDetails;
