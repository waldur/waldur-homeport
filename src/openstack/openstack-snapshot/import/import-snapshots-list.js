const importSnapshotsList = {
  templateUrl: 'views/partials/filtered-list.html',
  controller: ImportSnapshotsListController,
  controllerAs: 'ListController',
  bindings: {
    provider: '<',
  }
};

export default importSnapshotsList;

// @ngInject
function ImportSnapshotsListController(
  baseControllerListClass, importSnapshotsService, $scope, $state, $filter, ncUtils) {
  let controllerScope = this;
  let controllerClass = baseControllerListClass.extend({
    init: function() {
      this.controllerScope = controllerScope;
      this.service = importSnapshotsService;
      this.$filter = $filter;
      this.$state = $state;
      this.ncUtils = ncUtils;
      $scope.$on('providerChanged', (event, args) => this.changeProvider(args.data));
      this.tableOptions = this.getTableOptions();
      this.selectedItems = [];
      this._super();
    },
    changeProvider: function(provider) {
      this.initialized = false;
      controllerScope.provider = provider;
      this.resetCache().then(() => this.initialized = true);
    },
    getTableOptions: function() {
      return {
        disableSearch: true,
        enableOrdering: false,
        noDataText: gettext('No snapshots to import.'),
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
          title: gettext('Size'),
          render: row => {
            return this.$filter('filesize')(row.size);
          }
        },
        {
          title: gettext('Backend ID'),
          render: row => row.backend_id,
        },
        {
          title: gettext('Runtime State'),
          render: row => row.runtime_state,
        },
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
