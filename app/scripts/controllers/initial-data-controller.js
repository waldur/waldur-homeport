'use strict';

(function() {
  angular.module('ncsaas')
    .controller('InitialDataController',
      ['usersService', 'agreementsService', 'currentStateService', '$state',
        'baseControllerClass', InitialDataController]);

  function InitialDataController(
    usersService, agreementsService, currentStateService, $state, baseControllerClass) {
    /*jshint camelcase: false */
    var controllerScope = this;
    var Controller = baseControllerClass.extend({
      user: null,
      errors: {},
      plan: {},

      init: function() {
        this._super();
        this.activate();
      },
      activate: function() {
        var vm = this;
        usersService.getCurrentUser().then(function(response) {
          vm.user = response;
          if (response.email) {
            $state.go('dashboard.index');
          }
        });

        currentStateService.getCustomer().then(function(customer) {
          agreementsService.getList({customer: customer.uuid}).then(function(agreements) {
            if (agreements.length !== 0) {
              vm.plan = agreements[0].plan;
            }
          });
        });
      },
      // XXX: This is quick fix, we need to get display names from backend, but currently quotas on backend do not
      // have display names
      getPrettyQuotaName: function(name) {
        var prettyNames = {
          'nc_user_count': 'users',
          'nc_resource_count': 'resources',
          'nc_project_count': 'projects'
        };
        return prettyNames[name];
      },
      save: function() {
        var vm = this;
        if (vm.user.email) {
          vm.user.$update(
            function() {
              usersService.currentUser = null;
              $state.go('dashboard.index');
            },
            function(error) {
              vm.errors = error.data;
            }
          );
        } else {
          var errorText = 'This field is required';
          vm.errors.email = [errorText];
        }
      }

    });

    controllerScope.__proto__ = new Controller();
  }

})();

(function() {

  angular.module('ncsaas')
    .controller('InitialDataControllerDemo',
    ['usersService',
     'servicesService',
     'baseControllerClass',
     'currentStateService',
     'agreementsService',
     'customersService',
     'joinService',
     '$q',
     '$state',
     InitialDataControllerDemo]);

  function InitialDataControllerDemo(
    usersService,
    servicesService,
    baseControllerClass,
    currentStateService,
    agreementsService,
    customersService,
    joinService,
    $q,
    $state) {
    var controllerScope = this;
    var Controller = baseControllerClass.extend({
      user: {},
      services: {},
      chosenService: null,
      chosenServices: [],

      init: function() {
        this._super();
        this.activate();
      },
      activate: function() {
        this.getUser();
        this.getServices();
        this.getCustomer();
      },
      getUser: function() {
        var vm = this;
        usersService.getCurrentUser().then(function(response) {
          vm.user = response;
        });
      },
      getServices: function() {
        var vm = this;
        servicesService.getServicesOptions().then(function(service_options) {
          vm.service_options = service_options;
        });
      },
      getCustomer: function() {
        var vm = this;
        currentStateService.getCustomer().then(function(customer) {
          vm.customer = customer;
          agreementsService.getList({customer: customer.uuid}).then(function(agreements) {
            if (agreements.length !== 0) {
              vm.agreement = agreements[0];
            }
          });
        });
      },
      // XXX: This is quick fix, we need to get display names from backend, but currently quotas on backend do not
      // have display names
      getPrettyQuotaName: function(name, count) {
        return name.replace(/nc_|_count/gi,'') + (count > 1 ? 's' : '');
      },
      addService: function(service) {
        this.chosenServices.push(service);
      },
      addChosenService: function() {
        if (!this.chosenService) {
          return;
        }
        var service = this.service_options[this.chosenService];
        service.saved = false;
        if (!(this.chosenServices.lastIndexOf(service) + 1)) {
          this.addService(service);
        }
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
          return !service.saved;
        });
        var promises = unsavedServices.map(function(service) {
          service.non_field_errors = {};
          var options = vm.prepareServiceOptions(service);
          return joinService.createService(service.url, options).then(function() {
            service.saved = true;
          });
        });
        return $q.all(promises);
      },
      prepareServiceOptions: function(service){
        var result = {};
        for (var i = 0; i < service.options.length; i++) {
          var option = service.options[i];
          if (option.value) {
            result[option.key] = option.value;
          }
          result['customer'] = this.customer.url;
          result['name'] = service.name;
        }
        return result;
      },
      save: function() {
        var vm = this;
        if (!vm.user.email) {
          vm.user.errors = {email: 'This field is required'};
          return;
        }
        function serviceSuccess(response) {
          usersService.currentUser = null;
          $state.go('dashboard.index');
        }
        function serviceError(response) {
          for (var i = 0; i < vm.chosenServices.length; i++) {
            var serviceName = response.config.data.name;
            var service = vm.chosenServices[i];
            if (service.name == serviceName) {
              service.errors = response.data;
            }
          }
        }
        function userSuccess(argument) {
          vm.customer.$update().then(function() {
            vm.saveServices().then(serviceSuccess, serviceError);
          });
        }
        function userError(response) {
          vm.user.errors = response.data;
        }
        vm.user.$update().then(userSuccess, userError);
      }
    });

    controllerScope.__proto__ = new Controller();
  }

})();
