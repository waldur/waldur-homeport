const importVirtualMachinesList = {
  templateUrl: 'views/partials/filtered-list.html',
  controller: ImportVirtualMachinesListController,
  controllerAs: 'ListController',
  bindings: {
    provider: '<',
  }
};

export default importVirtualMachinesList;

// @ngInject
function ImportVirtualMachinesListController(
  baseControllerListClass, importResourcesService, ENV, $scope, $state, $filter, ncUtils) {
  let controllerScope = this;
  let controllerClass = baseControllerListClass.extend({
    init: function() {
      this.controllerScope = controllerScope;
      this.service = importResourcesService;
      this.$filter = $filter;
      this.$state = $state;
      this.ncUtils = ncUtils;
      this.service.setEndpoint(ENV.resourcesTypes.vms, controllerScope.provider);
      $scope.$on('providerChanged', (event, args) => this.setProvider(args.data));
      this.tableOptions = this.getTableOptions();
      this.selectedItems = [];
      this._super();
    },
    setProvider: function(provider) {
      this.initialized = false;
      controllerScope.provider = provider;
      this.service.setEndpoint(ENV.resourcesTypes.vms, provider);
      this.resetCache().then(() => this.initialized = true);
    },
    getTableOptions: function() {
      return {
        disableSearch: true,
        enableOrdering: false,
        noDataText: gettext('No virtual machines to import.'),
        columns: this.getColumns(),
        tableActions: [],
        select: true,
      };
    },
    getColumns: function() {
      return [
        {
          title: gettext('Name'),
          className: 'all',
          render: row => row.name
        },
        {
          title: gettext('Runtime state'),
          className: 'min-tablet-l',
          render: row => row.runtime_state || 'N/A'
        },
        {
          title: gettext('Flavor'),
          render: row => row.flavor_name
        },
        {
          title: gettext('RAM'),
          className: 'desktop',
          render: function(row) {
            return $filter('filesize')(row.ram) || 'N/A';
          }
        },
        {
          title: gettext('CPU'),
          className: 'desktop',
          render: function(row) {
            return row.cores || 'N/A';
          }
        }
      ];
    },
    requestLoad(request, filter) {
      return this._super(request, filter).then(() => {
        this.onSelect([]);
      });
    },
    onSelect(items) {
      this.selectedItems = items;
      $scope.$emit('selectedItemsChanged', {data: this.selectedItems});
    },
    getSelectedItems() {
      return this.selectedItems;
    },
    getFilter: function() {
      return {
        service_project_link: controllerScope.provider.service_project_link_url,
        service_settings_uuid: controllerScope.provider.settings_uuid,
      };
    },
  });

  controllerScope.__proto__ = new controllerClass();
}
