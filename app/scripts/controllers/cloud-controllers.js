'use strict';

(function() {
  angular.module('ncsaas')
    .controller('CloudListController', ['cloudsService', CloudListController]);

  function CloudListController(cloudsService) {
    var vm = this;

    vm.list = cloudsService.getCloudList();
    vm.remove = remove;

    function remove(cloud) {
      var index = vm.list.indexOf(cloud);

      cloud.$delete(function() {
        vm.list.splice(index, 1);
      });
    }

  }

})();

