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
  var controllerScope = this;
  var ResourceController = baseResourceListController.extend({
    init: function() {
      this.controllerScope = controllerScope;
      this._super();
      this.service = openstackVolumesService;
      this.rowFields.push('size');
    },
    getFilter: function() {
      return {
        snapshot: controllerScope.resource.url,
      };
    },
    getTableOptions: function() {
      var options = this._super();
      options.noDataText = gettext('You have no restored volumes yet.');
      options.noMatchesText = gettext('No restored volumes found matching filter.');
      options.columns = options.columns.filter(function(item) {
        return item.title.toLowerCase() !== 'provider';
      });

      options.columns.push(
        {
          title: gettext('Size'),
          render: function(row) {
            return $filter('filesize')(row.size);
          }
        },
        {
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
