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
      options.noDataText = gettext('You have no private clouds yet.');
      options.noMatchesText = gettext('No private clouds found matching filter.');
      return options;
    },
    getCreateTitle: function() {
      return gettext('Add private cloud');
    }
  });
  controllerScope.__proto__ = new ResourceController();
}
