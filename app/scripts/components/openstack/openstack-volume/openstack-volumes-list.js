const openstackVolumesList = {
  controller: VolumesListController,
  controllerAs: 'ListController',
  templateUrl: 'views/partials/filtered-list.html',
  bindings: {
    onListReceive: '&',
  }
};

export default openstackVolumesList;

// @ngInject
function VolumesListController(BaseProjectResourcesTabController, ncUtils, $state, $filter, ENV) {
  var controllerScope = this;
  var ResourceController = BaseProjectResourcesTabController.extend({
    init:function() {
      this.category = ENV.Storages;
      this.controllerScope = controllerScope;
      this._super();
      this.rowFields.push('size');
      this.rowFields.push('instance');
      this.rowFields.push('instance_name');
    },
    getFilter: function() {
      return {
        resource_type: 'OpenStackTenant.Volume'
      };
    },
    getTableOptions: function() {
      var options = this._super();
      options.noDataText = gettext('You have no volumes yet.');
      options.noMatchesText = gettext('No volumes found matching filter.');
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
        title: gettext('Attached to'),
        className: 'min-tablet-l',
        render: function(row) {
          if (!row.instance) {
            return '&ndash;';
          }
          var uuid = ncUtils.getUUID(row.instance);
          var href = $state.href('resources.details', {
            uuid: uuid,
            resource_type: 'OpenStackTenant.Instance'
          });
          return ncUtils.renderLink(href, row.instance_name || 'OpenStack instance');
        }
      });
      return options;
    },
    getImportTitle: function() {
      return gettext('Import volumes');
    },
    getCreateTitle: function() {
      return gettext('Add volumes');
    }
  });
  controllerScope.__proto__ = new ResourceController();
}
