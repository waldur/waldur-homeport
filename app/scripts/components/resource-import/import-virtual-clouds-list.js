const importVirtualCloudsList = {
  templateUrl: 'views/partials/filtered-list.html',
  controller: ImportVirtualCloudsListController,
  controllerAs: 'ListController',
  bindings: {
    provider: '<',
  }
};

export default importVirtualCloudsList;

// @ngInject
function ImportVirtualCloudsListController(
  baseControllerListClass, importResourcesService, ENV, $scope, $state, $filter, ncUtils) {
  let controllerScope = this;
  let controllerClass = baseControllerListClass.extend({
    init: function() {
      this.controllerScope = controllerScope;
      this.service = importResourcesService;
      this.$filter = $filter;
      this.$state = $state;
      this.ncUtils = ncUtils;
      this.service.setEndpoint(ENV.resourcesTypes.private_clouds, controllerScope.provider);
      $scope.$on('providerChanged', (event, args) => this.setProvider(args.data));
      this.tableOptions = this.getTableOptions();
      this.selectedItems = [];
      this._super();
    },
    setProvider: function(provider) {
      this.initialized = false;
      controllerScope.provider = provider;
      this.service.setEndpoint(ENV.resourcesTypes.private_clouds, controllerScope.provider);
      this.resetCache().then(() => this.initialized = true);
    },
    getTableOptions: function() {
      return {
        disableSearch: true,
        enableOrdering: false,
        noDataText: gettext('No private clouds to import.'),
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
          title: gettext('Description'),
          render: row => row.description
        },
        {
          title: gettext('Backend ID'),
          render: row => row.backend_id
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
      };
    },
  });

  controllerScope.__proto__ = new controllerClass();
}
