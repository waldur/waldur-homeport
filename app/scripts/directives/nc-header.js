'use strict';

(function() {

  angular.module('ncsaas')
    .directive('ncHeader', [ncHeader]);

  function ncHeader() {
    return {
      restrict: 'E',
      templateUrl: 'views/directives/nc-header.html'
    };
  }
})();
