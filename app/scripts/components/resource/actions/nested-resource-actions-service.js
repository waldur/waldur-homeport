// @ngInject
export default function nestedResourceActionsService(
  actionUtilsService) {
  this.loadNestedActions = function(controller, model, tab) {
    return actionUtilsService.loadActions(model).then(function(actions) {
      var nestedActions = [];
      angular.forEach(actions, (value, key) => {
        if (value.tab && value.tab === tab) {
          nestedActions.push({
            name: value.nestedTabTitle,
            callback: actionUtilsService
              .buttonClick.bind(actionUtilsService, controller, model, key, value),
            disabled: !value.enabled,
            titleAttr: value.reason
          });
        }
      });
      return nestedActions;
    });
  };
}
