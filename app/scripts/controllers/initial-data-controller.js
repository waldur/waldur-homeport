'use strict';

(function() {

  angular.module('ncsaas')
    .controller('InitialDataController',
    ['usersService',
     'servicesService',
     'baseControllerClass',
     'customersService',
     'projectsService',
     'plansService',
     'currentStateService',
     'joinService',
     '$q',
     '$rootScope',
     '$state',
     'ENV',
     'ncUtils',
     InitialDataController]);

  function InitialDataController(
    usersService,
    servicesService,
    baseControllerClass,
    customersService,
    projectsService,
    plansService,
    currentStateService,
    joinService,
    $q,
    $rootScope,
    $state,
    ENV,
    ncUtils) {
    var controllerScope = this;
    var Controller = baseControllerClass.extend({
      user: {},
      customer: {},
      services: {},
      project: {},
      chosenService: null,
      chosenServices: [],
      currentProcess: null,

      init: function() {
        this._super();
        this.activate();
      },
      activate: function() {
        var vm = this;
        this.getUser();
        this.getServices();
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
      getServices: function() {
        if (ENV.featuresVisible || ENV.toBeFeatures.indexOf('providers') == -1) {
          var vm = this;
          servicesService.getServicesOptions().then(function(service_options) {
            vm.service_options = service_options;
            vm.addChosenService('Amazon');
            vm.addChosenService('DigitalOcean');
          });
        }
      },
      getPrettyQuotaName: function(name, count) {
        return ncUtils.getPrettyQuotaName(name) + (count > 1 ? 's' : '');
      },
      addChosenService: function(name) {
        if (!name) {
          name = this.chosenService;
        }
        if (!name) {
          return;
        }
        var service = this.service_options[name];
        if (!service) {
          return;
        }
        service.saved = false;
        service.status = 'Offline';
        this.chosenServices.push(angular.copy(service));
      },
      removeService: function(service) {
        var index = this.chosenServices.lastIndexOf(service);
        if (index + 1) {
          this.chosenServices.splice(index, 1);
        }
      },
      saveServices: function() {
        var vm = this;
        var unsavedServices = this.chosenServices.filter(function(service) {
          service.errors = {};
          return !service.saved;
        });
        vm.currentProcess = 'saving services..';
        // return successfully if no services require creation
        if (unsavedServices.length < 1) {
            return true;
        }
        var promises = unsavedServices.map(function(service) {
          var instance = joinService.$create(service.url);
          for (var i = 0; i < service.options.length; i++) {
            var option = service.options[i];
            if (option.value) {
              instance[option.key] = option.value;
            }
          }
          instance.customer = vm.customer.url;
          instance.name = service.name;
          var deferred = $q.defer();
          service.status = 'Processing';
          instance.$save().then(function() {
            service.saved = true;
            service.errors = {};
            service.status = 'Online';
            deferred.resolve();
          }, function(errors) {
            service.errors = errors;
            service.status = 'Erred';
            deferred.reject(errors);
          });
          return deferred.promise;
        });
        return $q.all(promises);
      },
      saveUser: function() {
        var vm = this;
        vm.currentProcess = 'saving user..';
        return vm.user.$update(function() {
          usersService.currentUser = null;
        }, function(response) {
          vm.user.errors = response.data;
        });
      },
      saveCustomer: function() {
        var vm = this;
        if (vm.customer.uuid) {
          return $q.defer().resolve();
        }
        vm.currentProcess = 'saving customer..';
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
          return $q.defer().resolve();
        }
        vm.currentProcess = 'saving project..';
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
        return vm.saveUser()
                 .then(vm.saveCustomer.bind(vm))
                 .then(vm.saveServices.bind(vm))
                 .then(vm.saveProject.bind(vm))
                 .then(vm.gotoDashboard);
      },

      getClass: function(state) {
        var cls = ENV.servicesStateColorClasses[state];
        if (cls == 'processing') {
          return 'icon refresh spin';
        } else {
          return 'status-circle ' + cls;
        }
      }
    });

    controllerScope.__proto__ = new Controller();
  }

})();