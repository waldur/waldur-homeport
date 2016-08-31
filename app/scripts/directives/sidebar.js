'use strict';

(function() {

  angular.module('ncsaas')
    .directive('sidebar', ['$state', sidebar]);

  function sidebar($state) {
    return {
      restrict: 'E',
      scope: {
        items: '=',
        context: '='
      },
      templateUrl: 'views/directives/sidebar.html',
      link: function(scope) {
        scope.$state = $state;
      }
    };
  }
})();
