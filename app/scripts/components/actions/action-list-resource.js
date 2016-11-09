import template from './action-list-resource.html';

export default function actionListResource() {
  return {
    restrict: 'E',
    template: template,
    scope: {
      entity: '=',
      controller: '='
    },
    controller: ActionListController
  };
}

// @ngInject
function ActionListController(actionUtilsService, scope) {
  function loadActions() {
    scope.loading = true;
    actionUtilsService.loadActions(scope.entity).then(function(actions) {
      if (actions) {
        scope.actions = actions;
      }
    }).finally(function() {
      scope.loading = false;
    });
  }
  scope.buttonClick = function(name, action) {
    action.pending = true;
    var promise = actionUtilsService.buttonClick(scope.controller, scope.entity, name, action);
    promise.finally(function() {
      action.pending = false;
      loadActions();
    });
  }
  scope.loading = false;
  loadActions();
  scope.$watch('entity', function(newEntity, oldEntity) {
    if (newEntity.state !== oldEntity.state) {
      loadActions();
    }
  });
}
