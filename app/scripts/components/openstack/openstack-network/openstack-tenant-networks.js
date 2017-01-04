const openstackTenantNetworks = {
  bindings: {
    resource: '<'
  },
  templateUrl: 'views/partials/filtered-list.html',
  controller: TenantNetworksController,
  controllerAs: 'ListController',
};

// @ngInject
function TenantNetworksController(
  baseResourceListController, openstackNetworksService) {
  var controllerScope = this;
  var controllerClass = baseResourceListController.extend({
    init: function() {
      this.controllerScope = controllerScope;
      this._super();
      this.service = openstackNetworksService;
    },
    getTableOptions: function() {
      var options = this._super();
      options.noDataText = 'No networks yet.';
      options.noMatchesText = 'No networks found matching filter.';
      return options;
    },
    getFilter: function() {
      return {
        tenant_uuid: controllerScope.resource.uuid
      };
    }
  });

  controllerScope.__proto__ = new controllerClass();
}

export default openstackTenantNetworks;
