'use strict';

(function() {
  angular.module('ncsaas')
    .controller('HomeController', ['$rootScope', HomeController]);

  function HomeController($rootScope) {
    $rootScope.bodyClass = true;
  }

})();
