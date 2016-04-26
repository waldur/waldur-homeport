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
      ResourceSLAController]);

  function ResourceSLAController(
    baseControllerClass) {
    var controllerScope = this;
    var controllerClass = baseControllerClass.extend({
      init: function() {
        this.controllerScope = controllerScope;
        this._super();

        this.data = [];
        this.events = [
          {
            "timestamp": 1418043540,
            "state": "U"
          },
          {
            "timestamp": 1417928550,
            "state": "D"
          },
          {
            "timestamp": 1417928490,
            "state": "U"
          }
        ];

        for (var i = 0; i <= 10; i++) {
          this.data.push({
            date: new Date(2011, i, 1),
            value: i * 10
          });
        }
      }
    });

    controllerScope.__proto__ = new controllerClass();
  }
})();

