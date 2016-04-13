'use strict';

(function() {

  angular.module('ncsaas')
    .directive('expandableIndicator', [expandableIndicator]);

  function expandableIndicator() {
    return {
      restrict: 'E',
      template: '<a class="expandable-indicator icon" ng-class="{\'chevron-circle-down\': !open, \'chevron-circle-up\': open}"></a>',
      scope: {
        open: '='
      },
      replace: true
    };
  }
})();
