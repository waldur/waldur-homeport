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
  baseResourceListController, openstackNetworksService, actionUtilsService) {
  var controllerScope = this;
  var controllerClass = baseResourceListController.extend({
    init: function() {
      this.controllerScope = controllerScope;
      this.listActions = null;
      var list_type = 'networks';
      var fn = this._super.bind(this);
      var vm = this;

      actionUtilsService.loadNestedActions(this, controllerScope.resource, list_type).then(result => {
        vm.listActions = result;
        fn();
        this.addRowFields(['subnets']);
        vm.service = openstackNetworksService;
      });
    },
    getTableOptions: function() {
      var options = this._super();
      var vm = this;
      options.noDataText = gettext('No networks yet.');
      options.noMatchesText = gettext('No networks found matching filter.');
      options.columns = [
        {
          title: gettext('Name'),
          className: 'all',
          render: function(row) {
            return vm.renderResourceName(row);
          }
        },
        {
          title: gettext('Subnets'),
          className: 'min-tablet-l',
          render: function(row) {
            return row.subnets.map(function(subnet) {
              return `${subnet.name}: ${subnet.cidr}`;
            }).join('<br />');
          }
        },
        {
          title: gettext('State'),
          className: 'min-tablet-l',
          render: function(row) {
            return vm.renderResourceState(row);
          }
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
    }
  });

  controllerScope.__proto__ = new controllerClass();
}

export default openstackTenantNetworks;
