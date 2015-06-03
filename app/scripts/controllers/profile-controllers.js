'use strict';

(function() {
  angular.module('ncsaas')
    .controller('DetailUpdateProfileController', ['usersService', 'customersService',
      'projectsService', 'baseControllerDetailUpdateClass', 'authService', 'keysService',
      '$translate', 'LANGUAGE',
      DetailUpdateProfileController]);

  function DetailUpdateProfileController(
    usersService, customersService, projectsService, baseControllerDetailUpdateClass, authService, keysService, 
    $translate, LANGUAGE) {
    var controllerScope = this;
    var Controller = baseControllerDetailUpdateClass.extend({
      activeTab: 'eventlog',
      customers: {},
      projects: {},

      init:function() {
        this.setSignalHandler('currentCustomerUpdated', this.getProjects.bind(controllerScope));
        this.service = usersService;
        this.controllerScope = controllerScope;
        this._super();
        this.detailsState = 'profile.details';
      },
      activate: function() {
        var vm = this;
        usersService.getCurrentUser(true).then(function(response) {
          vm.model = response;
          keysService.getUserKeys(vm.model.uuid).then(function(response) {
            vm.model.keys = response;
          });
        });
        vm.customers = [];
        customersService.getList().then(function(response) {
          vm.customers = response;
        });
        vm.getProjects();

        this.LANGUAGE_CHOICES = LANGUAGE.CHOICES;
        this.selectedLanguage = $translate.use();
      },
      getProjects: function() {
        var vm = this;
        projectsService.getList().then(function(response) {
          vm.projects = response;
        });
      },
      deleteAccount: function() {
        if (confirm('Are you sure you want to delete your account?')) {
          this.model.$delete(
            authService.signout,
            function(errors) {
              alert(errors.data.detail);
            }
          );
        }
      },

      changeLanguage: function() {
        $translate.use(this.selectedLanguage);
      }
    });

    controllerScope.__proto__ = new Controller();
  }
})();
