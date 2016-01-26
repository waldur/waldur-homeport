'use strict';

(function() {
  angular.module('ncsaas')
    .directive('actionList', [actionList]);

  function actionList() {
    return {
      restrict: 'E',
      templateUrl: 'views/directives/action-list.html',
      replace: true,
      scope: {
        actions: '=',
        entity: '='
      }
    };
  }
})();
