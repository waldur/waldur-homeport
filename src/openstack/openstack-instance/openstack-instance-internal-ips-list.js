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
  let controllerScope = this;
  let controllerClass = baseResourceListController.extend({
    init: function() {
      this.controllerScope = controllerScope;
      this.listActions = null;
      let list_type = 'internal_ips';
      let fn = this._super.bind(this);

      this.loading = true;
      actionUtilsService.loadNestedActions(this, controllerScope.resource, list_type).then(result => {
        this.listActions = result;
        fn();
        this.addRowFields(['internal_ips_set']);
      });
    },
    afterGetList: function() {
      this.list = this.list[0] ? this.list[0].internal_ips_set : [];
    },
    reInitResource: function(resource) {
      this.service.$get(resource.resource_type, resource.uuid)
        .then(response => {
          this.controllerScope.resource.internal_ips_set = response.internal_ips_set;
        });
    },
    getTableOptions: function() {
      return {
        searchFieldName: 'subnet_name',
        noDataText: gettext('No internal IPs yet.'),
        noMatchesText: gettext('No internal IPs found matching filter.'),
        columns: [
          {
            title: gettext('IPv4 address'),
            render: row => row.ip4_address
          },
          {
            title: gettext('MAC address'),
            render: row => row.mac_address
          },
          {
            title: gettext('Subnet Name'),
            render: row => row.subnet_name
          },
          {
            title: gettext('Subnet CIDR'),
            render: row => row.subnet_cidr
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
