const openstackSubnetsList = {
  bindings: {
    resource: '<'
  },
  templateUrl: 'views/partials/filtered-list.html',
  controller: OpenstackSubnetsListController,
  controllerAs: 'ListController',
};

// @ngInject
function OpenstackSubnetsListController(
  baseResourceListController, openstackSubnetsService) {
  var controllerScope = this;
  var controllerClass = baseResourceListController.extend({
    init: function() {
      this.controllerScope = controllerScope;
      this._super();
      this.service = openstackSubnetsService;
    },
    getTableOptions: function() {
      var options = this._super();
      options.noDataText = 'No subnets yet.';
      options.noMatchesText = 'No subnets found matching filter.';
      return options;
    },
    getFilter: function() {
      return {
        network_uuid: controllerScope.resource.uuid
      };
    }
  });

  controllerScope.__proto__ = new controllerClass();
}

export default openstackSubnetsList;
