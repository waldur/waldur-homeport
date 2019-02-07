const azureSQLDatabasesList = {
  bindings: {
    resource: '<'
  },
  templateUrl: 'views/partials/filtered-list.html',
  controller: azureSQLDatabasesListController,
  controllerAs: 'ListController',
};

// @ngInject
function azureSQLDatabasesListController(
  baseResourceListController, azureSQLDatabasesService) {
  let controllerScope = this;
  let controllerClass = baseResourceListController.extend({
    init: function() {
      this.controllerScope = controllerScope;
      this._super();
      this.service = azureSQLDatabasesService;
      this.addRowFields(['charset']);
    },
    getTableOptions: function() {
      let options = this._super();
      let vm = this;
      options.noDataText = gettext('No databases yet.');
      options.noMatchesText = gettext('No databases found matching filter.');
      options.columns = [
        {
          title: gettext('Name'),
          className: 'all',
          orderField: 'name',
          render: row => vm.renderResourceName(row),
        },
        {
          title: gettext('Charset'),
          className: 'min-tablet-l',
          render: row => row.charset,
        },
        {
          title: gettext('State'),
          className: 'min-tablet-l',
          render: row => vm.renderResourceState(row),
        },
      ];

      return options;
    },
    getFilter: function() {
      return {
        server_uuid: controllerScope.resource.uuid
      };
    },
    getTableActions: function() {
      return [];
    }
  });

  controllerScope.__proto__ = new controllerClass();
}

export default azureSQLDatabasesList;
