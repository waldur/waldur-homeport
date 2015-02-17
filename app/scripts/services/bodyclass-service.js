'use strict';

(function() {
  angular.module('ncsaas')
    .service('BodyClassService', [BodyClassService]);

    function BodyClassService() {
      var vm = this;
      vm.getBodyClass = getBodyClass;

      function getBodyClass(name) {
        var bodyClass;

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
            bodyClass = 'app-body site-body';
            return bodyClass;
          } else {
            bodyClass = 'app-body obj-view';
            return bodyClass;
          }
        } else {
          bodyClass = 'app-body'
          return bodyClass;
        }
      }
    }

})();
