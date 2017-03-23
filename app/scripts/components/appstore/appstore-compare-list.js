import template from './appstore-compare-list.html';

const AppstoreCompareList = {
  controller: AppstoreCompareListController,
  controllerAs: 'ListController',
  template: template,
};

export default AppstoreCompareList;

// @ngInject
function AppstoreCompareListController(
  defaultPriceListItemsService,
  baseControllerListClass,
  $filter) {
  var controllerScope = this;
  var Controller = baseControllerListClass.extend({
    init: function() {
      this.controllerScope = controllerScope;
      this.service = defaultPriceListItemsService;
      this._super();
    },
    afterGetList: function() {
      this.tableOptions = this.getTableOptions();
    },
    getTableOptions: function() {
      return {
        searchFieldName: 'name',
        noDataText: gettext('No resources to compare yet.'),
        noMatchesText: gettext('No resources found matching filter.'),
        columns: [
          {
            title: gettext('Provider'),
            className: 'all',
            render: function(row) {
              return row.resource_type || 'N/A';
            }
          },
          {
            title: gettext('Code'),
            className: 'all',
            render: function(row) {
              return row.key || 'N/A';
            }
          },
          {
            title: gettext('Name'),
            className: 'all',
            render: function(row) {
              return row.metadata.name || 'N/A';
            }
          },
          {
            title: gettext('CPU'),
            className: 'desktop',
            render: function(row) {
              return row.metadata.cores || 'N/A';
            }
          },
          {
            title: gettext('RAM'),
            className: 'desktop',
            render: function(row) {
              return $filter('filesize')(row.metadata.ram) || 'N/A';
            }
          },
          {
            title: gettext('Storage'),
            className: 'desktop',
            render: function(row) {
              return $filter('filesize')(row.metadata.disk) || 'N/A';
            }
          },
          {
            title: gettext('Price/hour'),
            className: 'desktop',
            render: function(row) {
              return row.value || 'N/A';
            }
          },
        ],
      };
    }
  });
  controllerScope.__proto__ = new Controller();
}
