// @ngInject
export default function nestedResourceActionsService(
  actionUtilsService, NestedActionConfiguration) {
  this.loadNestedActions = function(controller, model, tab) {
    return actionUtilsService.loadActions(model).then(function(actions) {
      var nestedActions = [];
      angular.forEach(NestedActionConfiguration[model.resource_type].options, (value, key) => {
        if (value.tab === tab) {
          nestedActions.push({
            name: value.title,
            callback: actionUtilsService
              .buttonClick.bind(actionUtilsService, controller, model, key, actions[key]),
            disabled: !actions[key].enabled,
            titleAttr: actions[key].reason
          });
        }
      });
      return nestedActions;
    });
  };
}
