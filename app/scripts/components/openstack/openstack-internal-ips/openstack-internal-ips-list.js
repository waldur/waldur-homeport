const openstackInternalIpsList = {
  bindings: {
    resource: '<'
  },
  templateUrl: 'views/partials/filtered-list.html',
  controller: OpenstackInternalIpsListController,
  controllerAs: 'ListController',
};

// @ngInject
function OpenstackInternalIpsListController(
  baseResourceListController, actionUtilsService) {
  var controllerScope = this;
  var controllerClass = baseResourceListController.extend({
    init: function() {
      this.controllerScope = controllerScope;
      this.listActions = null;
      var list_type = 'internal_ips';
      var fn = this._super.bind(this);

      this.loading = true;
      actionUtilsService.loadNestedActions(this, controllerScope.resource, list_type).then(result => {
        this.listActions = result;
        fn();
        this.rowFields.push('internal_ips_set');
      });
    },
    afterGetList: function() {
      this.list = this.list[0].internal_ips_set;
    },
    getTableOptions: function() {
      return {
        searchFieldName: 'subnet_name',
        noDataText: gettext('No internal IPs yet.'),
        noMatchesText: gettext('No internal IPs found matching filter.'),
        columns: [
          {
            title: gettext('Name'),
            render: row => row.subnet_name
          },
          {
            title: gettext('CIDR'),
            render: row => row.subnet_cidr
          },
          {
            title: gettext('IP4 address'),
            render: row => row.ip4_address
          },
          {
            title: gettext('MAC address'),
            render: row => row.mac_address
          },
        ],
        tableActions: this.getTableActions()
      };
    },
    getFilter: function() {
      return {
        uuid: controllerScope.resource.uuid
      };
    },
    getTableActions: function() {
      return this.listActions;
    },
  });

  controllerScope.__proto__ = new controllerClass();
}

export default openstackInternalIpsList;
