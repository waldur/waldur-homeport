const openstackSnapshotsNestedList = {
  bindings: {
    resource: '<'
  },
  templateUrl: 'views/partials/filtered-list.html',
  controllerAs: 'ListController',
  controller: OpenstackSnapshotsNestedListController,
};

export default openstackSnapshotsNestedList;

// @ngInject
function OpenstackSnapshotsNestedListController(
  baseResourceListController, openstackSnapshotsService, $filter) {
  // @ngInject
  var controllerScope = this;
  var controllerClass = baseResourceListController.extend({
    init: function() {
      this.controllerScope = controllerScope;
      this._super();
      this.service = openstackSnapshotsService;
      this.addRowFields(['size']);
    },
    getTableOptions: function() {
      var options = this._super();
      options.disableSearch = true;
      options.noDataText = gettext('No snapshots yet.');
      options.noMatchesText = gettext('No snapshots found matching filter.');
      options.columns = [
        {
          title: gettext('Name'),
          className: 'all',
          render: row => this.renderResourceName(row)
        },
        {
          title: gettext('State'),
          className: 'min-tablet-l',
          render: row => this.renderResourceState(row)
        },
        {
          title: gettext('Size'),
          render: function(row) {
            if (!row.size) {
              return '&ndash;';
            }
            return $filter('filesize')(row.size);
          }
        },
      ];
      return options;
    },
    getFilter: function() {
      return {
        snapshot_schedule: controllerScope.resource.url
      };
    }
  });

  controllerScope.__proto__ = new controllerClass();
}
