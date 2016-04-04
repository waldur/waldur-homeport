'use strict';

(function() {

  angular.module('ncsaas')
    .controller('InitialDataController',
    ['usersService',
     'baseControllerClass',
     'customersService',
     'projectsService',
     'plansService',
     'currentStateService',
     '$q',
     '$rootScope',
     '$state',
     'ncUtils',
     InitialDataController]);

  function InitialDataController(
    usersService,
    baseControllerClass,
    customersService,
    projectsService,
    plansService,
    currentStateService,
    $q,
    $rootScope,
    $state,
    ncUtils) {
    var controllerScope = this;
    var Controller = baseControllerClass.extend({
      user: {},
      customer: {},
      project: {},
      currentProcess: null,
      getFilename: ncUtils.getFilename,

      init: function() {
        this._super();
        this.activate();
      },
      activate: function() {
        var vm = this;
        this.getUser();
        this.getFreePlan();
        currentStateService.getCustomer().then(function(customer) {
          vm.customer = customer;
          currentStateService.getProject().then(function(project) {
            vm.project = project;
          })
        });
      },
      getUser: function() {
        var vm = this;
        usersService.getCurrentUser().then(function(response) {
          vm.user = response;
          // By default customer name is equal to user name
          vm.customer.name = 'My Organization';
        });
      },
      getFreePlan: function() {
        var vm = this;
        plansService.getFreePlan().then(function(plan) {
          vm.customer.plan = plan;
        })
      },
      getPrettyQuotaName: function(name, count) {
        return ncUtils.getPrettyQuotaName(name) + (count > 1 ? 's' : '');
      },
      saveUser: function() {
        var vm = this;
        vm.currentProcess = 'Saving user...';
        return vm.user.$update(function() {
          usersService.currentUser = null;
        }, function(response) {
          vm.user.errors = response.data;
        });
      },
      saveCustomer: function() {
        var vm = this;
        if (vm.customer.uuid) {
          return $q.when(true);
        }
        vm.currentProcess = 'Saving organization...';
        var customer = customersService.$create();
        customer.name = vm.customer.name;
        return customer.$save().then(function(model) {
          vm.customer = model;
          currentStateService.setCustomer(model);
          $rootScope.$broadcast('refreshCustomerList', {model: model, new: true, current: true});
        });
      },
      saveProject: function() {
        var vm = this;
        if (vm.project.uuid) {
          return $q.when(true);
        }
        vm.currentProcess = 'Saving project...';
        var project = projectsService.$create();
        project.customer = vm.customer.url;
        project.name = 'Default';
        return project.$save().then(function(model) {
          vm.project = model;
          currentStateService.setProject(vm.project);
          $rootScope.$broadcast('refreshProjectList', {
            model: vm.project, new: true, current: true
          });
        });
      },
      gotoDashboard: function() {
        $state.go('dashboard.index');
      },
      save: function() {
        var vm = this;
        if (!vm.user.email) {
          vm.user.errors = {email: 'This field is required'};
          return $q.reject();
        }
        if (!vm.customer.name) {
          vm.customer.errors = {name: 'This field is required'};
          return $q.reject();
        }
        return vm.saveCustomer()
                 .then(vm.saveProject.bind(vm))
                 .then(vm.saveUser.bind(vm))
                 .then(vm.gotoDashboard);
      }
    });

    controllerScope.__proto__ = new Controller();
  }

})();
