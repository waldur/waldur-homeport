'use strict';

(function() {

  angular.module('ncsaas')
    .directive('customerWorkspace', [customerWorkspace]);

  function customerWorkspace() {
    return {
      restrict: 'E',
      transclude: true,
      templateUrl: 'views/directives/customer-workspace.html'
    };
  }
})();
