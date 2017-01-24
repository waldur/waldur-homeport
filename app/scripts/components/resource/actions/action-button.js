import template from './action-button.html';

export default function actionButton() {
  return {
    restrict: 'E',
    template: template,
    scope: {
      buttonList: '=', // should be [{title: 'Click', clickFunction: function(model) {}}]
      buttonController: '=',
      buttonModel: '=', // using in ng-click="button.clickFunction(buttonModel)"
      buttonType: '@'
    }
  };
}
