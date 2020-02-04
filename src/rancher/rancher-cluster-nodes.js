import { $state } from '@waldur/core/services';

const rancherClusterNodes = {
  templateUrl: 'views/partials/filtered-list.html',
  controller: RancherClusterNodesListController,
  controllerAs: 'ListController',
  bindings: {
    resource: '<'
  }
};

export default rancherClusterNodes;

// @ngInject
function RancherClusterNodesListController(
  baseResourceListController,
  rancherNodesService,
  actionUtilsService,
  ncUtils) {
  let controllerScope = this;
  let ResourceController = baseResourceListController.extend({
    init: function() {
      this.controllerScope = controllerScope;
      let fn = this._super.bind(this);
      this.loading = true;
      actionUtilsService.loadNestedActions(this, controllerScope.resource, 'nodes').then(result => {
        this.listActions = result;
        fn();
        this.service = rancherNodesService;
        this.addRowFields(['instance_uuid', 'instance_name']);
        this.resourcePollingDisabled = true;
      });
    },
    getTableOptions: function() {
      let options = this._super();
      options.noDataText = gettext('There are no Kubernetes nodes yet.');
      options.noMatchesText = gettext('No Kubernetes nodes found matching filter.');

      options.columns = [
        {
          title: gettext('Node'),
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
    getTableActions: function() {
      return this.listActions;
    },
    getFilter: function() {
      return {
        cluster_uuid: controllerScope.resource.uuid,
      };
    },
  });
  controllerScope.__proto__ = new ResourceController();
}
