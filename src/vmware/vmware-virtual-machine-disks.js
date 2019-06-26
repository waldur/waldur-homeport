const instanceVolumes = {
  templateUrl: 'views/partials/filtered-list.html',
  controller: VMwareVirtualMachineDisksList,
  controllerAs: 'ListController',
  bindings: {
    resource: '<'
  }
};

export default instanceVolumes;

// @ngInject
function VMwareVirtualMachineDisksList(
  baseResourceListController,
  $filter,
  vmwareDisksService,
  actionUtilsService) {
  let controllerScope = this;
  let ResourceController = baseResourceListController.extend({
    init: function() {
      this.controllerScope = controllerScope;
      let fn = this._super.bind(this);
      this.loading = true;
      actionUtilsService.loadNestedActions(this, controllerScope.resource, 'disks').then(result => {
        this.listActions = result;
        fn();
        this.service = vmwareDisksService;
        this.addRowFields(['size']);
      });
    },

    getTableOptions: function() {
      let options = this._super();
      options.noDataText = gettext('You have no disks yet.');
      options.noMatchesText = gettext('No disks found matching filter.');
      options.columns = [
        {
          title: gettext('Name'),
          className: 'all',
          render: row => this.renderResourceName(row)
        },
        {
          title: gettext('Size'),
          render: row => $filter('filesize')(row.size)
        },
        {
          title: gettext('State'),
          className: 'min-tablet-l',
          render: row => this.renderResourceState(row)
        },
      ];
      return options;
    },
    getFilter: function() {
      return {
        vm_uuid: controllerScope.resource.uuid
      };
    },
    getTableActions: function() {
      return this.listActions;
    }
  });
  controllerScope.__proto__ = new ResourceController();
}
