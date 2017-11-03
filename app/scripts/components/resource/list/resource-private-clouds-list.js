const resourcePrivateCloudsList = {
  controller: ProjectPrivateCloudsTabController,
  controllerAs: 'ListController',
  templateUrl: 'views/partials/filtered-list.html',
};

export default resourcePrivateCloudsList;

// @ngInject
function ProjectPrivateCloudsTabController($scope,
                                           $timeout,
                                           BaseProjectResourcesTabController,
                                           ENV,
                                           TableExtensionService) {
  let controllerScope = this;
  let ResourceController = BaseProjectResourcesTabController.extend({
    init: function() {
      this.controllerScope = controllerScope;
      this.category = ENV.PrivateClouds;
      $scope.$on('PrivateCloudImported', function() {
        $timeout(function() {
          controllerScope.resetCache();
        });
      });
      this._super();
      this.addRowFields(['extra_configuration']);
    },
    getTableOptions: function() {
      let options = this._super();
      options.noDataText = gettext('You have no private clouds yet.');
      options.noMatchesText = gettext('No private clouds found matching filter.');
      return options;
    },
    getTableActions: function() {
      let actions = this._super();
      let tableActions = TableExtensionService.getTableActions('resource-private-clouds-list');
      return actions.concat(tableActions);
    },
    getCreateTitle: function() {
      return gettext('Add private cloud');
    }
  });
  controllerScope.__proto__ = new ResourceController();
}
