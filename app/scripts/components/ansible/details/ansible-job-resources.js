const ansibleJobResourcesList = {
  controller: AnsibleJobResourcesController,
  controllerAs: 'ListController',
  templateUrl: 'views/partials/filtered-list.html',
  bindings: {
    job: '<'
  },
};

export default ansibleJobResourcesList;

// @ngInject
function AnsibleJobResourcesController($scope, baseResourceListController, resourcesService) {
  const controllerScope = this;
  const ResourceController = baseResourceListController.extend({
    init: function() {
      this.controllerScope = controllerScope;
      this.service = resourcesService;
      this.connectWatchers();

      this._super();
    },
    getFilter: function() {
      return {
        tag: controllerScope.job.tag
      };
    },
    connectWatchers: function() {
      $scope.$on('refreshAnsibleResourcesList', () => {
        this.service.clearAllCacheForCurrentEndpoint();
        controllerScope.getList();
      });
    },
  });
  controllerScope.__proto__ = new ResourceController();
}
