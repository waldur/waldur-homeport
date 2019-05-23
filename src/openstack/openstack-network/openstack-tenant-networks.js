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
  baseResourceListController, openstackNetworksService, actionUtilsService, ncUtils, $sanitize) {
  let controllerScope = this;
  let controllerClass = baseResourceListController.extend({
    init: function() {
      this.controllerScope = controllerScope;
      this.listActions = null;
      let list_type = 'networks';
      let fn = this._super.bind(this);
      let vm = this;

      actionUtilsService.loadNestedActions(this, controllerScope.resource, list_type).then(result => {
        vm.listActions = result;
        fn();
        this.addRowFields(['subnets', 'is_external']);
        vm.service = openstackNetworksService;
      });
    },
    getTableOptions: function() {
      let options = this._super();
      let vm = this;
      options.noDataText = gettext('No networks yet.');
      options.noMatchesText = gettext('No networks found matching filter.');
      options.columns = [
        {
          title: gettext('Name'),
          className: 'all',
          orderField: 'name',
          render: function(row) {
            return vm.renderResourceName(row);
          }
        },
        {
          title: gettext('Subnets'),
          className: 'min-tablet-l',
          render: function(row) {
            return row.subnets.map(function(subnet) {
              return `${$sanitize(subnet.name)}: ${subnet.cidr}`;
            }).join('<br />');
          }
        },
        {
          title: gettext('State'),
          className: 'min-tablet-l',
          render: function(row) {
            return vm.renderResourceState(row);
          }
        },
        {
          title: gettext('Is external'),
          render: row => ncUtils.booleanField(row.is_external),
        },
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
