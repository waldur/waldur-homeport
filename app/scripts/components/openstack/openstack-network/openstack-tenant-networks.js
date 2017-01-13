const openstackTenantNetworks = {
  bindings: {
    resource: '<'
  },
  templateUrl: 'views/partials/filtered-list.html',
  controller: TenantNetworksController,
  controllerAs: 'ListController',
};

// @ngInject
function TenantNetworksController(
  baseResourceListController, openstackNetworksService, resourceUtils, $state, ncUtils) {
  var controllerScope = this;
  var controllerClass = baseResourceListController.extend({
    init: function() {
      this.controllerScope = controllerScope;
      this._super();
      this.service = openstackNetworksService;
    },
    getTableOptions: function() {
      var options = this._super();
      var vm = this;
      options.noDataText = 'No networks yet.';
      options.noMatchesText = 'No networks found matching filter.';
      options.columns = [
        {
          title: 'Name',
          className: 'all',
          render: function(row) {
            var img = '<img src="{src}" title="{title}" class="img-xs m-r-xs">'
              .replace('{src}', resourceUtils.getIcon(row))
              .replace('{title}', row.resource_type);
            var href = $state.href('resources.details', {
              uuid: row.uuid,
              resource_type: row.resource_type
            });
            return ncUtils.renderLink(href, img + ' ' + row.name);
          }
        },
        {
          title: 'Subnets',
          className: 'min-tablet-l',
          render: function(row) {
            return row.subnets.map(function(subnet) {
              return `${subnet.name}: ${subnet.cidr}`;
            }).join('<br />');
          }
        },
        {
          title: 'State',
          className: 'min-tablet-l',
          render: function(row) {
            var uuids = vm.list.map(function(item) {
              return item.uuid;
            });
            var index = uuids.indexOf(row.uuid);
            return '<resource-state resource="controller.list[{index}]"></resource-state>'
              .replace('{index}', index);
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
      return [];
    }
  });

  controllerScope.__proto__ = new controllerClass();
}

export default openstackTenantNetworks;
