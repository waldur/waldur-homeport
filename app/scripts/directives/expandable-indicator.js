'use strict';

(function() {

  angular.module('ncsaas')
    .directive('expandableIndicator', [expandableIndicator]);

  function expandableIndicator() {
    return {
      restrict: 'E',
      template: '<a class="expandable-indicator icon chevron-circle-down"  ng-class="{\'closed\': !open, \'opened\': open}"></a>',
      scope: {
        open: '='
      },
      replace: true
    };
  }
})();
