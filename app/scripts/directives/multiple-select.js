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
      templateUrl: 'views/directives/multiple-select.html'
    };
  }
})();
