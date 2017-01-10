const openstackSecurityGroupsList = {
  bindings: {
    resource: '<'
  },
  templateUrl: 'views/partials/filtered-list.html',
  controller: OpenstackSecurityGroupsListController,
  controllerAs: 'ListController',
};

// @ngInject
function OpenstackSecurityGroupsListController(
  baseResourceListController, openstackSecurityGroupsService) {
  var controllerScope = this;
  var controllerClass = baseResourceListController.extend({
    init: function() {
      this.controllerScope = controllerScope;
      this._super();
      this.service = openstackSecurityGroupsService;
    },
    getTableOptions: function() {
      var options = this._super();
      options.noDataText = 'No security groups yet.';
      options.noMatchesText = 'No security groups found matching filter.';
      return options;
    },
    getFilter: function() {
      return {
        tenant_uuid: controllerScope.resource.uuid
      };
    },
    getTableActions: function() {
      return [];
    }
  });

  controllerScope.__proto__ = new controllerClass();
}

export default openstackSecurityGroupsList;
