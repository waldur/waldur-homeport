const vmwareVirtualMachinePorts = {
  bindings: {
    resource: '<'
  },
  templateUrl: 'views/partials/filtered-list.html',
  controller: VMwareVirtualMachinePortsController,
  controllerAs: 'ListController',
};

// @ngInject
function VMwareVirtualMachinePortsController(
  baseResourceListController, actionUtilsService, vmwarePortsService) {
  let controllerScope = this;
  let controllerClass = baseResourceListController.extend({
    init: function() {
      this.controllerScope = controllerScope;
      let fn = this._super.bind(this);
      this.loading = true;
      actionUtilsService.loadNestedActions(this, controllerScope.resource, 'ports').then(result => {
        this.listActions = result;
        fn();
        this.service = vmwarePortsService;
        this.addRowFields(['network_name', 'mac_address']);
      });
    },
    getTableOptions: function() {
      let options = this._super();
      let vm = this;
      options.noDataText = gettext('No ports yet.');
      options.noMatchesText = gettext('No ports found matching filter.');
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
          title: gettext('Network'),
          className: 'min-tablet-l',
          render: function(row) {
            return row.network_name;
          }
        },
        {
          title: gettext('MAC address'),
          className: 'min-tablet-l',
          render: function(row) {
            return row.mac_address;
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
    getTableActions: function() {
      return this.listActions;
    },
    getFilter: function() {
      return {
        vm_uuid: controllerScope.resource.uuid
      };
    },
  });

  controllerScope.__proto__ = new controllerClass();
}

export default vmwareVirtualMachinePorts;
