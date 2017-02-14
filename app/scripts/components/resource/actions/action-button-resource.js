import template from './action-button-resource.html';
import './action-button-resource.scss';

export default function actionButtonResource() {
  return {
    restrict: 'E',
    template: template,
    scope: {},
    controller: ActionButtonController,
    controllerAs: '$ctrl',
    bindToController: {
      buttonController: '=',
      buttonModel: '='
    }
  };
}

// @ngInject
class ActionButtonController {
  constructor(actionUtilsService, NestedActionConfiguration) {
    this.actionUtilsService = actionUtilsService;
    this.NestedActionConfiguration = NestedActionConfiguration;
    this.actions = [];
    this.loading = false;
  }

  onClick(name, action) {
    this.actionUtilsService.buttonClick(this.buttonController, this.buttonModel, name, action);
  }

  onToggle(open) {
    if (this.buttonController.toggleRefresh) {
      this.buttonController.toggleRefresh(open);
    }
    if (open) {
      this.openList();
    }
  }

  buttonClass(action) {
    return {
      disabled: !action.enabled || action.pending,
      remove: action.destructive
    };
  }

  openList() {
    this.loading = true;
    this.actions = [];
    this.actionUtilsService.loadActions(this.buttonModel).then(actions => {
      let actionsObj = {};
      angular.forEach(actions, (value, key) => {
        if (!this.NestedActionConfiguration[this.buttonModel.resource_type].options[key]) {
          actionsObj[key] = value;
        }
      });
      this.actions = actionsObj;
    }).finally(() => {
      this.loading = false;
    });
  }
}
