import template from './expert-request-details.html';

const expertRequestProjectDetails = {
  template: template,
  controller: class ExpertRequestProjectDetailsController {
    // ngInject
    constructor($rootScope,
                $scope,
                $stateParams,
                expertRequestsService) {
      this.$rootScope = $rootScope;
      this.$scope = $scope;
      this.$stateParams = $stateParams;
      this.expertRequestsService = expertRequestsService;
    }

    $onInit() {
      this.$scope.$on('reloadExpertRequest', this.loadExpertRequest.bind(this));
      this.loadExpertRequest();
      this.unlisten = this.$rootScope.$on('refreshExpertDetails', this.loadExpertRequest.bind(this));
    }

    loadExpertRequest() {
      this.loading = true;
      return this.expertRequestsService.$get(this.$stateParams.requestId)
        .then(expertRequest => {
          this.expertRequest = expertRequest;
        }).finally(() => {
          this.loading = false;
        });
    }

    $onDestroy() {
      this.unlisten();
    }
  }
};

export default expertRequestProjectDetails;
