const importVolumesList = {
  templateUrl: 'views/partials/filtered-list.html',
  controller: ImportVolumesListController,
  controllerAs: 'ListController',
  bindings: {
    provider: '<',
  }
};

export default importVolumesList;

// @ngInject
function ImportVolumesListController(
  baseControllerListClass, importVolumesService, $scope, $state, $filter, ncUtils) {
  let controllerScope = this;
  let controllerClass = baseControllerListClass.extend({
    init: function() {
      this.controllerScope = controllerScope;
      this.service = importVolumesService;
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
        noDataText: gettext('No volumes to import.'),
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
          title: gettext('Bootable'),
          render: row => this.ncUtils.booleanField(row.bootable),
        },
      ];
    },
    requestLoad(request, filter) {
      // check if that it is
      return this._super(request, filter).then(() => {
        this.onDeselect(this.selectedItems);
      });
    },
    onSelect(items) {
      this.selectedItems = this.selectedItems.concat(items);
      this.fireSelectedItemsChanged();
    },
    onDeselect(items) {
      for (let i = 0; i<items.length; i++) {
        this.selectedItems = this.selectedItems.filter(item => item.backend_id !== items[i].backend_id);
      }
      this.fireSelectedItemsChanged();
    },
    fireSelectedItemsChanged() {
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
