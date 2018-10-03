import template from './action-button-resource.html';
import './action-button-resource.scss';

class ActionButtonController {
  // @ngInject
  constructor(actionUtilsService) {
    this.actionUtilsService = actionUtilsService;
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
        if (!value.tab) {
          actionsObj[key] = value;
        }
      });
      this.actions = actionsObj;
    }).finally(() => {
      this.loading = false;
    });
  }
}

const actionButtonResource = {
  template: template,
  controller: ActionButtonController,
  bindings: {
    buttonController: '<',
    buttonModel: '<'
  }
};

export default actionButtonResource;
