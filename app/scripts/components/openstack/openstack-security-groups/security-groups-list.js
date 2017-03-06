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

      this.loading = true;
      actionUtilsService.loadNestedActions(this, controllerScope.resource, list_type).then(result => {
        this.listActions = result;
        fn();
        this.rowFields.push('rules');
        this.service = openstackSecurityGroupsService;
      });
    },
    getTableOptions: function() {
      var options = this._super();
      options.noDataText = 'No security groups yet.';
      options.noMatchesText = 'No security groups found matching filter.';
      options.columns = [
        {
          title: gettext('Name'),
          render: row => this.renderResourceName(row)
        },
        {
          title: gettext('State'),
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
