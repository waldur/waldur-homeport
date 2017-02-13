const openstackFloatingIpsList = {
  bindings: {
    resource: '<'
  },
  templateUrl: 'views/partials/filtered-list.html',
  controller: OpenstackFloatingIpsListController,
  controllerAs: 'ListController',
};

// @ngInject
function OpenstackFloatingIpsListController(
  baseResourceListController, openstackFloatingIpsService, actionUtilsService) {
  var controllerScope = this;
  var controllerClass = baseResourceListController.extend({
    init: function() {
      this.controllerScope = controllerScope;
      this.listActions = null;
      this.controllerScope.list_type = 'floating_ip';
      var fn = this._super.bind(this);
      var vm = this;

      actionUtilsService.loadSingleActions(
        controllerScope.resource.resource_type, this.controllerScope.list_type, controllerScope.resource
      ).then(function(result){
        vm.listActions = result;
        fn();
        vm.service = openstackFloatingIpsService;
      });
    },
    getTableOptions: function() {
      var options = this._super();
      options.noDataText = 'No floating IPs yet.';
      options.noMatchesText = 'No floating IPs found matching filter.';
      options.columns = [
        {
          title: 'Floating IP',
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
      var actions = [];
      var vm = this;
      // TODO: comparisons in loop are unnecessary is listActions contain exactly single actions
      angular.forEach(this.listActions[0], function(value, key) {
        if (key === 'create_floating_ip') {
          actions.push({
            name: 'Create',
            callback: actionUtilsService
              .buttonClick.bind(actionUtilsService, vm, controllerScope.resource, key, value),
            disabled: !value.enabled,
            titleAttr: value.reason
          });
        }
        if (key === 'pull_floating_ips') {
          actions.push({
            name: 'Pull',
            callback: actionUtilsService
              .buttonClick.bind(actionUtilsService, vm, controllerScope.resource, key, value),
            disabled: !value.enabled,
            titleAttr: value.reason
          });
        }
      });

      return actions;
    },
  });

  controllerScope.__proto__ = new controllerClass();
}

export default openstackFloatingIpsList;
