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
      this.rowFields.push('cidr');
    },
    getTableOptions: function() {
      var options = this._super();
      var vm = this;
      options.noDataText = gettext('No subnets yet.');
      options.noMatchesText = gettext('No subnets found matching filter.');
      options.columns = [
        {
          title: gettext('Name'),
          className: 'all',
          render: function(row) {
            return vm.renderResourceName(row);
          }
        },
        {
          title: gettext('CIDR'),
          className: 'min-tablet-l',
          render: function(row) {
            return row.cidr;
          }
        },
        {
          title: gettext('State'),
          className: 'min-tablet-l',
          render: function(row) {
            return vm.renderResourceState(row);
          }
        }
      ];

      return options;
    },
    getFilter: function() {
      return {
        network_uuid: controllerScope.resource.uuid
      };
    },
    getTableActions: function() {
      return [];
    }
  });

  controllerScope.__proto__ = new controllerClass();
}

export default openstackSubnetsList;
