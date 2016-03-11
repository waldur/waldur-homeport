'use strict';

(function() {
  angular.module('ncsaas')
    .directive('actionListResource', ['actionUtilsService', actionListResource]);

  function actionListResource(actionUtilsService) {
    return {
      restrict: 'E',
      templateUrl: 'views/directives/action-list-resource.html',
      replace: true,
      scope: {
        entity: '=',
        controller: '='
      },
      link: function(scope) {
        function loadActions() {
          scope.loading = true;
          actionUtilsService.loadActions(scope.entity).then(function(response) {
            if (response.actions) {
              scope.actions = response.actions;
            }
          }).finally(function() {
            scope.loading = false;
          });
        }
        scope.buttonClick = function(name, action) {
          actionUtilsService.buttonClick(scope.controller, scope.entity, name, action);
        };
        scope.loading = false;
        loadActions();
      }
    };
  }
})();
