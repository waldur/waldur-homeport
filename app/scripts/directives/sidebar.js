'use strict';

(function() {

  angular.module('ncsaas')
    .directive('sidebar', [sidebar]);

  function sidebar() {
    return {
      restrict: 'E',
      scope: {
        items: '=',
        context: '='
      },
      templateUrl: 'views/directives/sidebar.html'
    };
  }
})();
