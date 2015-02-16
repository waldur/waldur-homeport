'use strict';

(function() {
  angular.module('ncsaas')
    .service('BodyClassService', ['$rootScope', BodyClassService]);

    function BodyClassService($rootScope) {
      var vm = this;

      $rootScope.bodyClass = 'app-body';
      vm.getBodyClass = getBodyClass;

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
        ]

        if (stateWithProfile.indexOf(name) > -1 ) {
          if (name === 'login' || name === 'home') {
            $rootScope.bodyClass = 'app-body site-body'
          } else {
            $rootScope.bodyClass = 'app-body obj-view'
          }
        } else {
          $rootScope.bodyClass = 'app-body'
        }
      }
    }

})();
