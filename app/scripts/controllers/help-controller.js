(function() {

  angular.module('ncsaas')
    .controller('HelpListController', ['baseControllerClass', 'ENV', HelpListController]);

  function HelpListController(baseControllerClass, ENV) {
    var controllerScope = this;
    var Controller = baseControllerClass.extend({
      init: function() {
        this.list = ENV.helpList;
        this.profileList = ENV.profileHelp;
        this.dashboardList = ENV.dashboardHelp;
        this._super();
      }
    });

    controllerScope.__proto__ = new Controller();
  }

})();

(function() {

  angular.module('ncsaas')
    .controller('HelpDetailsController', [
      'baseControllerClass',
      'ENV',
      '$stateParams',
      'alertsService',
      'eventsService',
      HelpDetailsController]);

  function HelpDetailsController(
    baseControllerClass,
    ENV,
    $stateParams,
    alertsService,
    eventsService) {
    var controllerScope = this;
    var Controller = baseControllerClass.extend({
      init: function() {
        this.getItem();
        this._super();
      },
      getItem: function() {
        if ($stateParams.name == ENV.profileHelp.sshKeys.name) {
          this.model = ENV.profileHelp.sshKeys;
          return;
        }
        if ($stateParams.name === ENV.dashboardHelp.alertsList.name) {
          this.model = ENV.dashboardHelp.alertsList;
          this.model.types = alertsService.getAvailableIconTypes();
          return;
        }
        if ($stateParams.name === ENV.dashboardHelp.eventsList.name) {
          this.model = ENV.dashboardHelp.eventsList;
          this.model.types = eventsService.getAvailableIconTypes();
          return;
        }
        var list = ENV.helpList;
        for (var i = 0; i < list.length; i++) {
          if (list[i].name == $stateParams.name) {
            this.model = list[i];
            break;
          }
        }
      }
    });

    controllerScope.__proto__ = new Controller();
  }

})();
