const openstackSnapshotsList = {
  controller: SnapshotsListController,
  controllerAs: 'ListController',
  templateUrl: 'views/partials/filtered-list.html',
  bindings: {
    onListReceive: '&',
  }
};

export default openstackSnapshotsList;

// @ngInject
function SnapshotsListController(BaseProjectResourcesTabController, ncUtils, $state, $filter) {
  var controllerScope = this;
  var ResourceController = BaseProjectResourcesTabController.extend({
    init: function() {
      this.controllerScope = controllerScope;
      this._super();
      this.rowFields.push('size');
      this.rowFields.push('source_volume');
      this.rowFields.push('source_volume_name');
    },
    getFilter: function() {
      return {
        resource_type: 'OpenStackTenant.Snapshot'
      };
    },
    getTableOptions: function() {
      var options = this._super();
      options.noDataText = gettext('You have no snapshots yet.');
      options.noMatchesText = gettext('No snapshots found matching filter.');
      options.columns.push({
        title: gettext('Size'),
        className: 'all',
        render: function(row) {
          if (!row.size) {
            return '&ndash;';
          }
          return $filter('filesize')(row.size);
        }
      });
      options.columns.push({
        title: gettext('Volume'),
        render: function(row) {
          if (!row.source_volume) {
            return gettext('Not known');
          }
          var uuid = ncUtils.getUUID(row.source_volume);
          var href = $state.href('resources.details', {
            uuid: uuid,
            resource_type: 'OpenStackTenant.Volume'
          });
          return ncUtils.renderLink(href, row.source_volume_name || 'Link');
        }
      });
      return options;
    },
    getImportTitle: function() {
      return gettext('Import snapshots');
    },
    getCreateTitle: function() {
      return gettext('Add snapshots');
    }
  });
  controllerScope.__proto__ = new ResourceController();
}
