'use strict';

(function() {
  angular.module('ncsaas')
    .service('BodyClassService', [BodyClassService]);

    function BodyClassService() {
      var vm = this;
      vm.setBodyClass = getBodyClass;

      function getBodyClass(name) {
        var stateWithProfile = [
          'profile',
          'profile-edit',
          'project',
          'project-edit',
          'customer',
          'customer-edit',
          'customer-plans',
          'user',
          'home',
          'login',
        ];

        if (stateWithProfile.indexOf(name) > -1 ) {
          if (name === 'login' || name === 'home') {
            vm.bodyClass = 'app-body site-body';
            return vm.bodyClass;
          } else {
            vm.bodyClass = 'app-body obj-view';
            return vm.bodyClass;
          }
        } else {
          vm.bodyClass = 'app-body'
          return vm.bodyClass;
        }
      }
    }

})();
