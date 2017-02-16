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
  baseResourceListController, openstackFloatingIpsService, actionUtilsService) {
  var controllerScope = this;
  var controllerClass = baseResourceListController.extend({
    init: function() {
      this.controllerScope = controllerScope;
      this.listActions = null;
      var list_type = 'floating_ips';
      var fn = this._super.bind(this);

      this.loading = true;
      actionUtilsService.loadNestedActions(this, controllerScope.resource, list_type).then(result => {
        this.listActions = result;
        fn();
        this.service = openstackFloatingIpsService;
      });
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
      return this.listActions;
    },
  });

  controllerScope.__proto__ = new controllerClass();
}

export default openstackFloatingIpsList;
