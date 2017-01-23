const resourcePrivateCloudsList = {
  controller: ProjectPrivateCloudsTabController,
  controllerAs: 'ListController',
  templateUrl: 'views/partials/filtered-list.html',
};

export default resourcePrivateCloudsList;

function ProjectPrivateCloudsTabController(BaseProjectResourcesTabController, ENV) {
  var controllerScope = this;
  var ResourceController = BaseProjectResourcesTabController.extend({
    init: function() {
      this.controllerScope = controllerScope;
      this.category = ENV.PrivateClouds;
      this._super();
    },
    getTableOptions: function() {
      var options = this._super();
      options.noDataText = 'You have no private clouds yet';
      options.noMatchesText = 'No private clouds found matching filter.';
      return options;
    },
    getImportTitle: function() {
      return 'Import private cloud';
    },
    getCreateTitle: function() {
      return 'Add private cloud';
    }
  });
  controllerScope.__proto__ = new ResourceController();
}
