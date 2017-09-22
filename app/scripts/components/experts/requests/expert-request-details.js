import template from './expert-request-details.html';

const expertRequestProjectDetails = {
  template: template,
  controller: class ExpertRequestProjectDetailsController {
    // ngInject
    constructor($rootScope,
                $stateParams,
                expertRequestsService) {
      this.$rootScope = $rootScope;
      this.$stateParams = $stateParams;
      this.expertRequestsService = expertRequestsService;
    }

    $onInit() {
      this.loading = true;
      this.loadExpertRequest().finally(() => {
        this.loading = false;
      });
      this.unlisten = this.$rootScope.$on('refreshExpertDetails', this.loadExpertRequest.bind(this));
    }

    loadExpertRequest() {
      return this.expertRequestsService.$get(this.$stateParams.requestId)
        .then(expertRequest => {
          this.expertRequest = expertRequest;
        });
    }

    $onDestroy() {
      this.unlisten();
    }
  }
};

export default expertRequestProjectDetails;
