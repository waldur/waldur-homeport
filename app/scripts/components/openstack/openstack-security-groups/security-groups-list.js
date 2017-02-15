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
  baseResourceListController, openstackSecurityGroupsService, actionUtilsService) {
  var controllerScope = this;
  var controllerClass = baseResourceListController.extend({
    init: function() {
      this.controllerScope = controllerScope;
      this.listActions = null;
      var list_type = 'security_groups';
      var fn = this._super.bind(this);
      var vm = this;

      actionUtilsService.loadNestedActions(this, controllerScope.resource, list_type).then(function(result) {
        vm.listActions = result;
        fn();
        vm.rowFields.push('rules');
        vm.service = openstackSecurityGroupsService;
      });
    },
    getTableOptions: function() {
      var options = this._super();
      options.noDataText = 'No security groups yet.';
      options.noMatchesText = 'No security groups found matching filter.';
      options.columns = [
        {
          title: 'Name',
          render: row => this.renderResourceName(row)
        },
        {
          title: 'State',
          render: row => this.renderResourceState(row)
        }
      ];
      return options;
    },
    getFilter: function() {
      return {
        tenant_uuid: controllerScope.resource.uuid
      };
    },
    getTableActions: function() {
      return this.listActions;
    }
  });

  controllerScope.__proto__ = new controllerClass();
}

export default openstackSecurityGroupsList;
