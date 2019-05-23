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
function SnapshotsListController(
  $scope,
  $sanitize,
  $state,
  $timeout,
  $filter,
  BaseProjectResourcesTabController,
  ncUtils,
  TableExtensionService,
  features) {
  let controllerScope = this;
  let ResourceController = BaseProjectResourcesTabController.extend({
    init: function() {
      this.controllerScope = controllerScope;
      this._super();
      this.addRowFields(['size', 'source_volume', 'source_volume_name']);
      $scope.$on('refreshSnapshotsList', function() {
        $timeout(function() {
          controllerScope.resetCache();
        });
      });
    },
    getFilter: function() {
      return {
        resource_type: 'OpenStackTenant.Snapshot'
      };
    },
    getTableOptions: function() {
      let options = this._super();
      options.tableActions = this.getTableActions();
      options.noDataText = gettext('You have no snapshots yet.');
      options.noMatchesText = gettext('No snapshots found matching filter.');
      options.columns.push({
        title: gettext('Size'),
        className: 'all',
        orderField: 'size',
        render: function(row) {
          if (!row.size) {
            return '&ndash;';
          }
          return $filter('filesize')(row.size);
        }
      });
      options.columns.push({
        title: gettext('Volume'),
        orderField: 'source_volume_name',
        render: function(row) {
          if (!row.source_volume) {
            return gettext('Not known');
          }
          let uuid = ncUtils.getUUID(row.source_volume);
          let href = $state.href('resources.details', {
            uuid: uuid,
            resource_type: 'OpenStackTenant.Volume'
          });
          return ncUtils.renderLink(href, $sanitize(row.source_volume_name) || 'Link');
        }
      });
      return options;
    },
    getTableActions: function() {
      let actions = TableExtensionService.getTableActions('openstack-snapshots-list');
      if (this.category !== undefined) {
        actions.push(this.getCreateAction());
      }
      if (features.isVisible('openMap')) {
        actions.push(this.getMapAction());
      }
      return actions;
    },
    getCreateTitle: function() {
      return gettext('Add snapshots');
    }
  });
  controllerScope.__proto__ = new ResourceController();
}
