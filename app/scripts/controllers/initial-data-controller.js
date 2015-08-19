'use strict';

(function() {

  angular.module('ncsaas')
    .controller('InitialDataController',
    ['usersService',
     'servicesService',
     'baseControllerClass',
     'currentStateService',
     'agreementsService',
     'joinService',
     '$q',
     '$state',
     InitialDataController]);

  function InitialDataController(
    usersService,
    servicesService,
    baseControllerClass,
    currentStateService,
    agreementsService,
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
          vm.addChosenService('Amazon');
          vm.addChosenService('DigitalOcean');
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
        var promises = unsavedServices.map(function(service) {
          var options = vm.prepareServiceOptions(service);

          return joinService.createService(service.url, options).success(function() {
            service.saved = true;
            service.errors = {};
          }).error(function(errors) {
            service.errors = errors;
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
      saveUser: function() {
        var vm = this;
        return vm.user.$update(function() {
          console.log('User has been saved');
        }, function(response) {
          vm.user.errors = response.data;
        });
      },
      save: function() {
        var vm = this;
        if (!vm.user.email) {
          vm.user.errors = {email: 'This field is required'};
          return;
        }
        $q.all([vm.saveUser(), vm.customer.$update(), vm.saveServices()]).then(function() {
          usersService.currentUser = null;
          $state.go('dashboard.index');
        });
      }
    });

    controllerScope.__proto__ = new Controller();
  }

})();
