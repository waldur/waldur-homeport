(function() {
  angular.module('ncsaas')
    .controller('ResourceBackupListTabController', [
      'currentStateService',
      'BaseBackupListController',
      '$stateParams',
      ResourceBackupListTabController
    ]);

  function ResourceBackupListTabController(currentStateService, BaseBackupListController, $stateParams) {
    var controllerScope = this;
    var Controller = BaseBackupListController.extend({
      init:function() {
        this.controllerScope = controllerScope;
        this.blockUIElement = 'tab-content';
        this._super();
      },
      getList: function(filter) {
        var vm = this;
        if ($stateParams.uuid) {
          this.service.defaultFilter.project_uuid = $stateParams.uuid;
          return this._super(filter);
        } else {
          var fn = this._super.bind(controllerScope);
          return currentStateService.getProject().then(function(response) {
            vm.service.defaultFilter.project_uuid = response.uuid;
            return fn(filter);
          });
        }
      }
    });

    controllerScope.__proto__ = new Controller();
  }
})();


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
        //this.hddGraphData = resourceMonitoringService.getHDDData();
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
            vm.hddGraphError = 'Not enough data for chart';
          }
        }, function(error) {
          vm.cpuGraphError = 'Not enough data for chart';
          vm.hddGraphError = 'Not enough data for chart';
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
          'item': 'vfs.fs.size[/,used]',
          'start': date[0],
          'end': date[1],
          'points_count': 5}).then(function(items_history) {
          vm.hddGraphData = items_history.map(function(item) {
            return {
              hdd: item.value,
              date: new Date(item.point*1000)
            };
          });
        }, function() {
          vm.hddGraphError = 'Chart is not available at this moment';
        });
      }
    });

    controllerScope.__proto__ = new controllerClass();
  }
})();
