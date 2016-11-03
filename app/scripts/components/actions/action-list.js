import template from './action-list.html';

function actionList() {
  return {
    restrict: 'E',
    template: template,
    scope: {
      actions: '=',
      entity: '='
    }
  };
}
