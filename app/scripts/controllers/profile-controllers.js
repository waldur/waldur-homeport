'use strict';

(function() {
  angular.module('ncsaas')
    .controller('ProfileController',
      ['usersService', 'customersService', 'projectsService', 'baseControllerClass', ProfileController]);

  function ProfileController(usersService, customersService, projectsService, baseControllerClass) {
    var controllerScope = this;
    var Controller = baseControllerClass.extend({
      activeTab: 'eventlog',
      user: {},
      customers: {},
      projects: {},
      controllerScope: null,

      init: function() {
        this.setSignalHandler('currentCustomerUpdated', this.getProjects.bind(controllerScope));
        this._super();
        this.activate();
      },
      activate: function() {
        var vm = this;
        vm.user = usersService.getCurrentUserWithKeys();
        vm.customers = customersService.getCustomersList();
        vm.getProjects();
      },
      getProjects: function() {
        var vm = this;
        projectsService.getList().then(function(response) {
          vm.projects = response;
        });
      }
    });

    controllerScope.__proto__ = new Controller();
  }

})();
