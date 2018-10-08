const restoredVolumesList = {
  controller: RestoredVolumesListController,
  controllerAs: 'ListController',
  templateUrl: 'views/partials/filtered-list.html',
  bindings: {
    resource: '<'
  },
};

export default restoredVolumesList;

// @ngInject
function RestoredVolumesListController($filter, baseResourceListController, openstackVolumesService) {
  let controllerScope = this;
  let ResourceController = baseResourceListController.extend({
    init: function() {
      this.controllerScope = controllerScope;
      this._super();
      this.service = openstackVolumesService;
      this.addRowFields(['size']);
    },
    getFilter: function() {
      return {
        snapshot: controllerScope.resource.url,
      };
    },
    getTableOptions: function() {
      let options = this._super();
      options.noDataText = gettext('You have no restored volumes yet.');
      options.noMatchesText = gettext('No restored volumes found matching filter.');
      options.hiddenColumns = [
        'provider',
      ];

      options.columns.push(
        {
          id: 'size',
          title: gettext('Size'),
          render: function(row) {
            return $filter('filesize')(row.size);
          }
        },
        {
          id: 'created',
          title: gettext('Created'),
          className: 'desktop',
          render: function(row) {
            return $filter('shortDate')(row.created) || '&mdash;';
          }
        }
      );
      return options;
    },
  });
  controllerScope.__proto__ = new ResourceController();
}
