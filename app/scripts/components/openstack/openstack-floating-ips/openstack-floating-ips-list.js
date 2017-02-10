const openstackFloatingIpsList = {
  bindings: {
    resource: '<'
  },
  templateUrl: 'views/partials/filtered-list.html',
  controller: OpenstackFloatingIpsListController,
  controllerAs: 'ListController',
};

// @ngInject
function OpenstackFloatingIpsListController(
  baseResourceListController, openstackFloatingIpsService) {
  var controllerScope = this;
  var controllerClass = baseResourceListController.extend({
    init: function() {
      this.controllerScope = controllerScope;
      this.controllerScope.list_type = 'floating_ip';
      this._super();
      this.service = openstackFloatingIpsService;
    },
    getTableOptions: function() {
      var options = this._super();
      options.noDataText = 'No floating IPs yet.';
      options.noMatchesText = 'No floating IPs found matching filter.';
      options.columns = [
        {
          title: 'Floating IP',
          render: row => this.renderResourceName(row)
        },
        {
          title: 'State',
          render: row => this.renderResourceState(row)
        }
      ];
      return options;
    },
    getFilter: function() {
      return {
        tenant_uuid: controllerScope.resource.uuid
      };
    },
    getTableActions: function() {
      return [];
    }
  });

  controllerScope.__proto__ = new controllerClass();
}

export default openstackFloatingIpsList;
