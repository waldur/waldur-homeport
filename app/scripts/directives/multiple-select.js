'use strict';

(function() {

  angular.module('ncsaas')
    .directive('multipleSelect', [multipleSelect]);

  function multipleSelect() {
    return {
      restrict: 'A',
      scope: {
        choices: '='
      },
      replace: true,
      templateUrl: 'views/directives/multiple-select.html'
    };
  }
})();
