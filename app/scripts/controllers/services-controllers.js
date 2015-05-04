'use strict';

(function() {
  angular.module('ncsaas')
    .controller('ServiceListController',
      ['$state', 'servicesService', 'customerPermissionsService', 'usersService', ServiceListController]);

  function ServiceListController($state, servicesService, customerPermissionsService, usersService) {
    var vm = this;

    vm.list = [];

    // search
    vm.searchInput = '';
    vm.search = search;
    vm.service = servicesService;

    vm.remove = remove;

    function activate() {
      getList();
      // init canUserAddService
      usersService.getCurrentUser().then(function(user) {
        /*jshint camelcase: false */
        if (user.is_staff) {
          vm.canUserAddService = true;
        }
        customerPermissionsService.userHasCustomerRole(user.username, 'owner').then(function(hasRole) {
          vm.canUserAddService = hasRole;
        });

      });
    }

    function getList(filters) {
      servicesService.getList(filters).then(function(response) {
        vm.list = response;
      });
    }

    function search() {
      getList({name: vm.searchInput});
    }

    function remove(service) {
      var confirmDelete = confirm('Confirm service deletion?');
      if (confirmDelete) {
        var index = vm.list.indexOf(service);
        service.$delete(function() {
          vm.list.splice(index, 1);
        },handleServiceActionException);
      }
    }

    function handleServiceActionException(response) {
      if (response.status === 409) {
        var message = response.data.status || response.data.detail;
        alert(message);
      }
    }

    activate();

  }

})();

(function() {
  angular.module('ncsaas')
    .controller('ServiceAddController', ['servicesService', '$state',
      'currentStateService', '$rootScope', 'projectCloudMembershipsService', 'projectsService', ServiceAddController]);

  function ServiceAddController(
    servicesService, $state, currentStateService, $rootScope, projectCloudMembershipsService, projectsService) {
    var vm = this;
    vm.service = servicesService.$create();
    vm.save = save;
    vm.cancel = cancel;
    vm.projectList = {};
    vm.custumersList = {};

    function activate() {
      currentStateService.getCustomer().then(function(customer) {
        vm.service.customer = customer.url;
      });
      /*jshint camelcase: false */
      if (vm.service.auth_url || vm.service.name) {
        if (confirm('Clean all fields?')) {
          vm.service.auth_url = '';
          vm.service.name = '';
        }
      }
    }

    $rootScope.$on('currentCustomerUpdated', activate);

    function save() {
      vm.service.$save(success, error);

      function success() {
        projectsService.filterByCustomer = false;
        projectsService.getList().then(function(response) {
          for (var i = 0; response.length > i; i++) {
            projectCloudMembershipsService.addRow(response[i].url, vm.service.url);
          }
        });
        $state.go('services.list');
      }

      function error(response) {
        vm.errors = response.data;
      }
    }

    function cancel() {
      $state.go('services.list');
    }

    activate();

  }

})();

(function() {
  angular.module('ncsaas')
    .controller('ServiceDetailUpdateController',
      ['baseControllerClass', 'servicesService', '$stateParams', '$state', ServiceDetailUpdateController]);

  function ServiceDetailUpdateController(baseControllerClass, servicesService, $stateParams, $state) {
    var controllerScope = this;
    var Controller = baseControllerClass.extend({
      service: null,

      init:function() {
        this._super();
        this.activate();
      },
      activate:function() {
        var vm = this;
        servicesService.$get($stateParams.uuid).then(function(response) {
          vm.service = response;
        });
      },
      remove:function() {
        if (confirm('Are you sure you want to delete service?')) {
          this.service.$delete(
            function() {
              $state.go('services.list');
            },
            function(errors) {
              alert(errors.data.detail);
            }
          );
        }
      }
    });

    controllerScope.__proto__ = new Controller();
  }
})();
