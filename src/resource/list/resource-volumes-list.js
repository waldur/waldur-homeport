const resourceVolumesList = {
  controller: VolumesListController,
  controllerAs: 'ListController',
  templateUrl: 'views/partials/filtered-list.html',
  bindings: {
    onListReceive: '&',
  }
};

export default resourceVolumesList;

// @ngInject
function VolumesListController(
  BaseProjectResourcesTabController,
  ncUtils,
  $state,
  $scope,
  $sanitize,
  $timeout,
  $filter,
  ENV,
  TableExtensionService,
  features) {
  let controllerScope = this;
  let ResourceController = BaseProjectResourcesTabController.extend({
    init:function() {
      this.category = ENV.Volumes;
      this.controllerScope = controllerScope;
      this._super();
      this.addRowFields(['size', 'instance', 'instance_name', 'bootable', 'backend_id', 'source_snapshot']);
      $scope.$on('refreshVolumesList', function() {
        $timeout(function() {
          controllerScope.resetCache();
        });
      });
    },
    getTableOptions: function() {
      let options = this._super();
      options.noDataText = gettext('You have no volumes yet.');
      options.noMatchesText = gettext('No volumes found matching filter.');
      options.tableActions = this.getTableActions();
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
        title: gettext('Attached to'),
        className: 'min-tablet-l',
        orderField: 'instance_name',
        render: function(row) {
          if (!row.instance) {
            return '&ndash;';
          }
          let uuid = ncUtils.getUUID(row.instance);
          let href = $state.href('resources.details', {
            uuid: uuid,
            resource_type: 'OpenStackTenant.Instance'
          });
          return ncUtils.renderLink(href, $sanitize(row.instance_name) || 'OpenStack instance');
        }
      });
      return options;
    },
    getTableActions: function() {
      let actions = TableExtensionService.getTableActions('resource-volumes-list');
      if (this.category !== undefined) {
        actions.push(this.getCreateAction());
      }
      if (features.isVisible('openMap')) {
        actions.push(this.getMapAction());
      }
      return actions;
    },
    getCreateTitle: function() {
      return gettext('Add volumes');
    }
  });
  controllerScope.__proto__ = new ResourceController();
}
