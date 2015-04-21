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


(function() {
  angular.module('ncsaas')
    .controller('UpdateProfileController', ['usersService', '$state', UpdateProfileController]);

  function UpdateProfileController(usersService, $state) {
    var vm = this;

    vm.user = {};
    vm.errors = {};
    vm.update = update;

    usersService.getCurrentUser().then(function(response) {
      vm.user = response;
    });

    function update() {
      vm.user.$update(success, error);

      function success() {
        $state.go('profile.details');
      }

      function error(response) {
        vm.errors = response.data;
      }
    }

  }

})();
