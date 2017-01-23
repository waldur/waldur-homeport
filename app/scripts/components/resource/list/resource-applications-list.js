const resourceApplicationsList = {
  controller: ProjectApplicationsTabController,
  controllerAs: 'ListController',
  templateUrl: 'views/partials/filtered-list.html',
};

export default resourceApplicationsList;

function ProjectApplicationsTabController(BaseProjectResourcesTabController, ENV) {
  var controllerScope = this;
  var ResourceController = BaseProjectResourcesTabController.extend({
    init:function() {
      this.controllerScope = controllerScope;
      this.category = ENV.Applications;
      this._super();
    },
    getTableOptions: function() {
      var options = this._super();
      options.noDataText = 'You have no applications yet.';
      options.noMatchesText = 'No applications found matching filter.';
      return options;
    },
    getImportTitle: function() {
      return 'Import application';
    },
    getCreateTitle: function() {
      return 'Add application';
    }
  });
  controllerScope.__proto__ = new ResourceController();
}
