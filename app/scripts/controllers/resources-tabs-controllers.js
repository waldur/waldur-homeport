(function() {
  angular.module('ncsaas')
    .controller('ResourceAlertsListController', [
      'BaseAlertsListController',
      'resourcesService',
      '$stateParams',
      ResourceAlertsListController]);

  function ResourceAlertsListController(
    BaseAlertsListController,
    resourcesService,
    $stateParams) {
    var controllerScope = this;
    var controllerClass = BaseAlertsListController.extend({
      init: function() {
        this.controllerScope = controllerScope;
        this._super();
      },

      getList: function(filter) {
        var vm = this;
        var fn = this._super.bind(vm);
        filter = filter || {};
        return resourcesService.$get($stateParams.resource_type, $stateParams.uuid).then(function(resource) {
          vm.service.defaultFilter.scope = resource.url;
          vm.service.defaultFilter.opened = true;
          return fn(filter);
        })
      }
    });

    controllerScope.__proto__ = new controllerClass();
  }
})();

(function() {
  angular.module('ncsaas')
      .controller('ResourceGraphsController', [
        'baseControllerClass',
        'resourcesService',
        'zabbixHostsService',
        'resourceMonitoringService',
        '$stateParams',
        ResourceGraphsController]);

  function ResourceGraphsController(
      baseControllerClass,
      resourcesService,
      zabbixHostsService,
      resourceMonitoringService,
      $stateParams) {
    var controllerScope = this;
    var controllerClass = baseControllerClass.extend({
      init: function() {
        this.controllerScope = controllerScope;
        this.service = resourcesService;
        this._super();
        this.noGraphsData = false;
        var vm = this,
            startDate = Math.floor(new Date().getTime() / 1000 - (24 * 3600)),
            endDate = Math.floor(new Date().getTime() / 1000);

        this.getModel().then(function(model) {
          vm.model = model;
          var zabbixExist = false;
          for (var i = 0; i < model.related_resources.length; i++) {
            if (model.related_resources[i].resource_type === "Zabbix.Host") {
              zabbixExist = true;
              vm.getZabbixItems(model.related_resources[i].uuid, [startDate, endDate]);
            }
          }
          if (!zabbixExist) {
            vm.cpuGraphError = 'Not enough data for chart';
            vm.ramGraphError = 'Not enough data for chart';
          }
        }, function(error) {
          vm.cpuGraphError = 'Not enough data for chart';
          vm.ramGraphError = 'Not enough data for chart';
        });
      },
      getModel: function() {
        return this.service.$get($stateParams.resource_type, $stateParams.uuid);
      },
      getZabbixItems: function(uuid, date) {
        var vm = this;
        zabbixHostsService.getList({
          UUID: uuid,
          operation: 'items_history',
          'item': 'proc.num[,,run]',
          'start': date[0],
          'end': date[1],
          'points_count': 5}).then(function(items_history) {
            vm.cpuGraphData = items_history.map(function(item) {
              return {
                core1: item.value,
                date: new Date(item.point*1000)
              };
            });
        }, function() {
          vm.cpuGraphError = 'Chart is not available at this moment';
        });
        zabbixHostsService.getList({
          UUID: uuid,
          operation: 'items_history',
          'item': 'vm.memory.size[available]',
          'start': date[0],
          'end': date[1],
          'points_count': 5}).then(function(items_history) {
          vm.ramGraphData = items_history.map(function(item) {
            return {
              hdd: item.value,
              date: new Date(item.point*1000)
            };
          });
        }, function() {
          vm.ramGraphError = 'Chart is not available at this moment';
        });
      }
    });

    controllerScope.__proto__ = new controllerClass();
  }
})();

(function() {
  angular.module('ncsaas')
    .controller('ResourceSLAController', [
      'baseControllerClass',
      'resourcesService',
      '$stateParams',
      'zabbixItservicesService',
      'zabbixHostsService',
      '$q',
      ResourceSLAController]);

  function ResourceSLAController(
    baseControllerClass,
    resourcesService,
    $stateParams,
    zabbixItservicesService,
    zabbixHostsService,
    $q) {
    var controllerScope = this;
    var controllerClass = baseControllerClass.extend({
      init: function() {
        this.controllerScope = controllerScope;
        this._super();
        var vm = this;

        resourcesService.$get($stateParams.resource_type, $stateParams.uuid).then(function(resource) {
          vm.resource = resource;
          if (resource.sla === null) {
            return;
          }
          var dataSla = [angular.extend(resource.sla, {date: new Date(resource.sla.period)})],
            requests = [];

          var slaEndDate = new Date(resource.sla.period);

          for (var i = 1; i < 10; i++) {
            var month = slaEndDate.getMonth() + 1 - i,
              year = slaEndDate.getFullYear();

            if (month < 1) {
              year -= 1;
              month = 12 + month;
            }

            var request = zabbixHostsService.$get(null, resource.url, {
              period: year + '-' + (month < 10 ? '0' + month : month ),
              field: 'sla'
            }).then(function(response) {
              response.sla && dataSla.push(angular.extend(response.sla, {date: new Date(response.sla.period)}));
            });

            requests.push(request);
          }

          $q.all(requests).then(function() {
            vm.data = dataSla.sort(function(a, b) {
              return a.date.getTime() - b.date.getTime();
            });
          });

          var zabbix = resource.related_resources.filter(function(item) {
            return item.resource_type === 'Zabbix.Host';
          })[0];

          zabbix && zabbixHostsService.$get(zabbix.uuid).then(function(host) {
            var related = host.related_resources.filter(function(item) {
              return item.resource_type === 'Zabbix.ITService';
            })[0];

            related && zabbixItservicesService.getList({UUID: related.uuid, operation: 'events'}).then(function(events) {
              vm.events = events.map(function(event) {
                event.timestamp = event.timestamp * 1000;
                return event;
              });
            });
          });

        });
      }
    });

    controllerScope.__proto__ = new controllerClass();
  }
})();

(function() {
  angular.module('ncsaas')
    .controller('VolumeSnapshotsListController', [
      'baseResourceListController',
      '$stateParams',
      VolumeSnapshotsListController
    ]);

  function VolumeSnapshotsListController(baseResourceListController, $stateParams) {
    var controllerScope = this;
    var ResourceController = baseResourceListController.extend({
      init: function() {
        this.controllerScope = controllerScope;
        this._super();
      },
      getTableOptions: function() {
        var options = this._super();
        options.noDataText = 'You have no snapshots yet';
        options.noMatchesText = 'No snapshots found matching filter.';
        return options;
      },
      getFilter: function() {
        return {
          source_volume_uuid: $stateParams.uuid,
          resource_type: 'OpenStack.Snapshot'
        };
      }
    });
    controllerScope.__proto__ = new ResourceController();
  }
})();
