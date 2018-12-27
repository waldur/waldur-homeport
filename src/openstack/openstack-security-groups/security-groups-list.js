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
  baseResourceListController, openstackSecurityGroupsService, actionUtilsService, $scope, $timeout) {
  let controllerScope = this;
  let controllerClass = baseResourceListController.extend({
    init: function() {
      this.controllerScope = controllerScope;
      this.listActions = null;
      let list_type = 'security_groups';
      let fn = this._super.bind(this);

      this.loading = true;
      actionUtilsService.loadNestedActions(this, controllerScope.resource, list_type).then(result => {
        this.listActions = result;
        fn();
        this.addRowFields(['rules']);
        this.service = openstackSecurityGroupsService;
      });

      $scope.$on('refreshSecurityGroupsList', function() {
        $timeout(function() {
          controllerScope.resetCache();
        });
      });
    },
    getTableOptions: function() {
      let options = this._super();
      options.noDataText = gettext('No security groups yet.');
      options.noMatchesText = gettext('No security groups found matching filter.');
      options.columns = [
        {
          title: gettext('Name'),
          orderField: 'name',
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
