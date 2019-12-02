const rancherClusterNodes = {
  templateUrl: 'views/partials/filtered-list.html',
  controller: RancherClusterNodesListController,
  controllerAs: 'ListController',
  bindings: {
    resource: '<'
  }
};

export default rancherClusterNodes;

// @ngInject
function RancherClusterNodesListController(baseResourceListController, rancherNodesService) {
  let controllerScope = this;
  let ResourceController = baseResourceListController.extend({
    init: function() {
      this.controllerScope = controllerScope;
      this._super();
      this.service = rancherNodesService;
      this.resourcePollingDisabled = true;
    },
    getTableOptions: function() {
      let options = this._super();
      options.noDataText = gettext('There are no Kubernetes nodes yet.');
      options.noMatchesText = gettext('No Kubernetes nodes found matching filter.');
      return options;
    },
    getFilter: function() {
      return {
        cluster_uuid: controllerScope.resource.uuid,
      };
    },
  });
  controllerScope.__proto__ = new ResourceController();
}
