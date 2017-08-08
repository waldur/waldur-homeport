const resourceVmsList = {
  controller: ProjectVirtualMachinesListController,
  controllerAs: 'ListController',
  templateUrl: 'views/partials/filtered-list.html',
};

export default resourceVmsList;

function ProjectVirtualMachinesListController(BaseProjectResourcesTabController, ENV) {
  var controllerScope = this;
  var ResourceController = BaseProjectResourcesTabController.extend({
    init: function() {
      this.controllerScope = controllerScope;
      this.category = ENV.VirtualMachines;
      this._super();
      this.addRowFields(['internal_ips', 'external_ips', 'floating_ips', 'internal_ips_set']);
    },
    getTableOptions: function() {
      var options = this._super();
      options.noDataText = gettext('You have no virtual machines yet.');
      options.noMatchesText = gettext('No virtual machines found matching filter.');
      options.columns.push({
        title: gettext('Internal IP'),
        orderField: 'internal_ips',
        render: function(row) {
          if (row.internal_ips.length === 0) {
            return '&ndash;';
          }
          return row.internal_ips.join(', ');
        }
      });
      options.columns.push({
        title: gettext('External IP'),
        orderField: 'external_ips',
        render: function(row) {
          if (row.external_ips.length === 0) {
            return '&ndash;';
          }
          return row.external_ips.join(', ');
        }
      });
      return options;
    },
    getCreateTitle: function() {
      return gettext('Add virtual machine');
    },
  });
  controllerScope.__proto__ = new ResourceController();
}
