import template from './expert-request-details.html';

const expertRequestDetails = {
  template: template,
  controller: class ExpertRequestDetailsController {
    // ngInject
    constructor(expertRequestsService,
                $stateParams,
                $state,
                $q,
                $rootScope,
                projectsService,
                customersService,
                WorkspaceService,
                usersService,
                currentStateService) {
      this.$stateParams = $stateParams;
      this.$state = $state;
      this.$q = $q;
      this.expertRequestsService = expertRequestsService;
      this.projectsService = projectsService;
      this.customersService = customersService;
      this.usersService = usersService;
      this.currentStateService = currentStateService;
      this.WorkspaceService = WorkspaceService;
      this.unlisten = $rootScope.$on('refreshExpertDetails', this.loadExpertRequest.bind(this));
    }

    $onInit() {
      this.loading = true;
      this.loadExpertRequest().then(() => {
        return this.projectsService.$get(this.expertRequest.project_uuid).then(project => {
          this.currentStateService.setProject(project);
          return { project };
        });
      }).then(({ project }) => {
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
      }).finally(() => {
        this.loading = false;
      });
    }

    loadExpertRequest() {
      return this.expertRequestsService.$get(this.$stateParams.uuid)
        .then(expertRequest => {
          this.expertRequest = expertRequest;
        });
    }

    $onDestroy() {
      this.unlisten();
    }
  }
};

export default expertRequestDetails;
