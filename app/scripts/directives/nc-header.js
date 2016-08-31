'use strict';

(function() {

  angular.module('ncsaas')
    .directive('ncHeader', [ncHeader]);

  function ncHeader() {
    return {
      restrict: 'E',
      transclude: true,
      templateUrl: 'views/directives/nc-header.html'
    };
  }
})();
