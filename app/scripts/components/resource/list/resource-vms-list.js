const resourceVmsList = {
  controller: ProjectVirtualMachinesListController,
  controllerAs: 'ListController',
  templateUrl: 'views/partials/filtered-list.html',
};

export default resourceVmsList;

// @ngInject
function ProjectVirtualMachinesListController(
  BaseProjectResourcesTabController,
  $scope,
  $timeout,
  ENV,
  TableExtensionService) {
  let controllerScope = this;
  let ResourceController = BaseProjectResourcesTabController.extend({
    init: function() {
      this.controllerScope = controllerScope;
      this.category = ENV.VirtualMachines;
      this._super();
      this.addRowFields([
        'internal_ips', 'external_ips', 'floating_ips', 'internal_ips_set',
        'flavor_name', 'cores', 'ram', 'disk'
      ]);
      $scope.$on('refreshVirtualMachinesList', function() {
        $timeout(function() {
          controllerScope.resetCache();
        });
      });
    },
    getTableOptions: function() {
      let options = this._super();
      options.noDataText = gettext('You have no virtual machines yet.');
      options.noMatchesText = gettext('No virtual machines found matching filter.');
      options.columns.push({
        title: gettext('Internal IP'),
        orderField: 'internal_ips',
        render: function(row) {
          const ips = row.internal_ips.filter(angular.identity);
          if (ips.length === 0) {
            return '&ndash;';
          }
          return ips.join(', ');
        }
      });
      options.columns.push({
        title: gettext('External IP'),
        orderField: 'external_ips',
        render: function(row) {
          const ips = (row.external_ips || []).filter(angular.identity);
          if (ips.length === 0) {
            return '&ndash;';
          }
          return ips.join(', ');
        }
      });
      return options;
    },
    getTableActions: function() {
      let actions = this._super();
      let tableActions = TableExtensionService.getTableActions('resource-vms-list');
      return actions.concat(tableActions);
    },
    getCreateTitle: function() {
      return gettext('Add virtual machine');
    },
  });
  controllerScope.__proto__ = new ResourceController();
}
