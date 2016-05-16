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
      ResourceSLAController]);

  function ResourceSLAController(
    baseControllerClass,
    resourcesService,
    $stateParams,
    zabbixItservicesService,
    zabbixHostsService) {
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
          vm.data = [angular.extend(resource.sla, {date: new Date(resource.sla.period)})];

          var zabbix= resource.related_resources.filter(function(item) {
            return item.resource_type === 'Zabbix.Host';
          })[0];

          zabbix && zabbixHostsService.$get(zabbix.uuid).then(function(host) {
            var related = host.related_resources.filter(function(item) {
              return item.resource_type === 'Zabbix.ITService';
            })[0];

            related && zabbixItservicesService.getList({UUID: related.uuid, operation: 'events'}).then(function(events) {
              vm.events = events;
            });
          });

        });
      }
    });

    controllerScope.__proto__ = new controllerClass();
  }
})();

