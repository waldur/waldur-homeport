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
  baseResourceListController, openstackFloatingIpsService, actionUtilsService, $state, ncUtils) {
  let controllerScope = this;
  let controllerClass = baseResourceListController.extend({
    init: function() {
      this.controllerScope = controllerScope;
      this.listActions = null;
      this.addRowFields(['instance_uuid', 'instance_name']);
      let list_type = 'floating_ips';
      let fn = this._super.bind(this);

      this.loading = true;
      actionUtilsService.loadNestedActions(this, controllerScope.resource, list_type).then(result => {
        this.listActions = result;
        fn();
        this.service = openstackFloatingIpsService;
      });
    },
    getTableOptions: function() {
      let options = this._super();
      options.noDataText = gettext('No floating IPs yet.');
      options.noMatchesText = gettext('No floating IPs found matching filter.');
      options.columns = [
        {
          title: gettext('Floating IP'),
          render: row => this.renderResourceName(row)
        },
        {
          title: gettext('State'),
          render: row => this.renderResourceState(row)
        },
        {
          title: gettext('Instance'),
          render: row => {
            if (!row.instance_uuid) {
              return gettext('Not assigned');
            }
            let href = $state.href('resources.details', {
              uuid: row.instance_uuid,
              resource_type: 'OpenStackTenant.Instance'
            });
            return ncUtils.renderLink(href, row.instance_name);
          }
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
    },
  });

  controllerScope.__proto__ = new controllerClass();
}

export default openstackFloatingIpsList;
