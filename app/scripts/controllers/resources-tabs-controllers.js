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

