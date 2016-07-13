'use strict';

(function() {
  angular.module('ncsaas')
    .directive('importResourceButton', importResourceButton);

    function importResourceButton() {
      return {
        restrict: 'E',
        templateUrl: 'views/directives/import-resource-button.html',
        scope: {
          resource: '=',
          toggle: '=',
          project: '=',
        }
      };
    }
})();
