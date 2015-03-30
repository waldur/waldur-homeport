'use strict';

(function() {
  angular.module('ncsaas')
    .controller('ServiceListController',
      ['servicesService', 'customerPermissionsService', 'usersService', ServiceListController]);

  function ServiceListController(servicesService, customerPermissionsService, usersService) {
    var vm = this;

    vm.list = servicesService.getServiceList();
    vm.remove = remove;
    vm.canUserAddService = null;

    function activate() {
      // init canUserAddService
      usersService.getCurrentUser().then(function(user) {
        /*jshint camelcase: false */
        if (user.is_staff) {
          vm.canUserAddService = true;
        }
        customerPermissionsService.getList({username: user.username}).then(function(permissions) {
          if (permissions.length !== 0) {
            vm.canUserAddService = (permissions[0].role === 'owner');
          }
        });
      });
    }

    function remove(service) {
      var index = vm.list.indexOf(service);

      service.$delete(function() {
        vm.list.splice(index, 1);
      });
    }

    activate();

  }

})();

